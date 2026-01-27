use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, mint_to, MintTo},
};

declare_id!("iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy");


pub const verifier_id: Pubkey = Pubkey::new_from_array([
    208, 238, 128, 178, 240, 192, 20, 219, 204, 57, 34, 220, 99, 60, 87, 24,
    108, 41, 15, 243, 242, 48, 187, 151, 229, 61, 164, 123, 113, 134, 87, 238
]);
#[program]
pub mod mintghost {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        merkle_root: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let config = &mut ctx.accounts.mintghost_account;
        config.authority = ctx.accounts.authority.key();
        config.merkle_root = merkle_root;
        config.name = name;
        config.symbol = symbol;
        config.uri = uri;
        config.mint_count = 0;
        config.bump = ctx.bumps.mintghost_account;
        msg!("Mintghost initialized!");
        Ok(())
    }

    pub fn update_root(
        ctx: Context<UpdateRoot>,
        merkle_root: [u8; 32],
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.merkle_root = merkle_root;
        msg!("Merkle root updated!");
        Ok(())
    }


    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof: Vec<u8>,
        witness: Vec<u8>,
        nullifier_hash: [u8; 32],
    ) -> Result<()> {
        msg!("Verifying proof: {} bytes", proof.len());
        require!(witness.len() >= 44, ErrorCode::InvalidWitness);
        let public_root: [u8; 32] = witness[12..44].try_into().unwrap();
        
        //check root
        require!(
            public_root == ctx.accounts.config.merkle_root,
            ErrorCode::RootMismatch
        );

        let mut data = Vec::with_capacity(proof.len() + witness.len());
        data.extend_from_slice(&proof);
        data.extend_from_slice(&witness);


        let ix = Instruction {
            program_id: verifier_id,
            accounts: vec![],
            data,
        };
        invoke(&ix, &[])?;
        msg!("PROOF VERIFIED!");


        require!(ctx.accounts.nullifier.status == 0, ErrorCode::AlreadyMinted);
        ctx.accounts.nullifier.status = 1;
        ctx.accounts.nullifier.bump = ctx.bumps.nullifier;

        
        ctx.accounts.config.mint_count += 1;
        msg!("Verification #{} complete!", ctx.accounts.config.mint_count);

        Ok(())
    }

    pub fn claim_nft(ctx: Context<ClaimNft>, nullifier_hash: [u8; 32]) -> Result<()> {
        require!(ctx.accounts.nullifier.status == 1, ErrorCode::NotVerified);

        let seeds = &[b"config".as_ref(), &[ctx.accounts.config.bump]];
        let signer = &[&seeds[..]]; 
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.nft_mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            1,
        )?;
        ctx.accounts.nullifier.status = 2;  
        msg!("NFT MINTED!!!>>>>>");
        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + MintghostAccount::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub mintghost_account: Account<'info, MintghostAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRoot<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, MintghostAccount>,
}



#[derive(Accounts)]
#[instruction(nullifier_hash: [u8; 32])]
pub struct ClaimNft<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, MintghostAccount>,
    
    #[account(
        mut,
        seeds = [b"nullifier_v7", nullifier_hash.as_ref()],
        bump = nullifier.bump,
        constraint = nullifier.status == 1 @ ErrorCode::NotVerified
    )]
    pub nullifier: Account<'info, Nullifier>,
    
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = config,
    )]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = user,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}








#[derive(Accounts)]
#[instruction(proof: Vec<u8>, witness: Vec<u8>, nullifier_hash: [u8; 32])]
pub struct VerifyProof<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, MintghostAccount>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 2,
        seeds = [b"nullifier_v7", nullifier_hash.as_ref()],
        bump,
    )]
    pub nullifier: Account<'info, Nullifier>,
    pub system_program: Program<'info, System>,
    pub verifier_program: UncheckedAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct MintghostAccount {
    pub authority: Pubkey,
    pub merkle_root: [u8; 32],
    #[max_len(32)]
    pub name: String,
    #[max_len(10)]
    pub symbol: String,
    #[max_len(200)]
    pub uri: String,
    pub mint_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Nullifier {
    pub status: u8,  
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid witness format")]
    InvalidWitness,
    #[msg("Merkle root mismatch")]
    RootMismatch,
    #[msg("Already minted with this proof")]
    AlreadyMinted,
    #[msg("Proof not verified yet")]
    NotVerified,
    #[msg("Already claimed NFT")]
    AlreadyClaimed,
}

use dep::poseidon::poseidon::bn254;

fn main(
    the_secret: Field,
    index: u32,
    hash_path: [Field; 20],
    root: pub Field
) {
    let leaf = bn254::hash_1([the_secret]);
    let calc_root = calculateRoot(leaf, index, hash_path);
    assert(calc_root == root);
}

fn calculateRoot(leaf: Field, index: u32, hash_path: [Field; 20]) -> Field {
    let mut current = leaf;

 
    let bits32: [u1; 32] = (index as Field).to_le_bits();
    let mut indexbits: [u1; 20] = [0; 20];
    for i in 0..20 {
        indexbits[i] = bits32[i];
    }

    for i in 0..20 {
        let element = hash_path[i];
        let (left, right) = if indexbits[i] == 0 {
            (current, element)
        } else {
            (element, current)
        };

        current = bn254::hash_2([left, right]);
    }

    current
}

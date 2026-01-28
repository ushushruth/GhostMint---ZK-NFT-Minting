'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.1) {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [ref, threshold]);

    return isInView;
}

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const featuresRef = useRef<HTMLDivElement>(null);
    const techRef = useRef<HTMLDivElement>(null);
    const useCasesRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    const featuresInView = useInView(featuresRef);
    const techInView = useInView(techRef);
    const useCasesInView = useInView(useCasesRef);
    const ctaInView = useInView(ctaRef);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="min-h-screen bg-[#050508] text-white overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full animate-blob-1"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full animate-blob-2"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)', filter: 'blur(80px)' }} />
                <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full animate-blob-3"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            </div>

            <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-5">
                    <div className="flex items-center gap-2 md:gap-4">
                        <img src="/logo.png" alt="MintGhost" className="w-7 h-7 md:w-10 md:h-10" />
                        <span className="text-base md:text-xl font-semibold tracking-tight">MintGhost</span>
                    </div>
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/" className="text-white font-medium text-base">Home</Link>
                        <Link href="/problem" className="text-base text-zinc-400 hover:text-white transition-colors">Problem</Link>
                        <Link href="/solution" className="text-base text-zinc-400 hover:text-white transition-colors">Solution</Link>
                        <Link href="/roadmap" className="text-base text-zinc-400 hover:text-white transition-colors">Roadmap</Link>
                        <a href="https://github.com/ushushruth/GhostMint---ZK-NFT-Minting" target="_blank" className="text-zinc-400 hover:text-white transition-colors">GitHub</a>
                        <Link href="/mint" className="bg-violet-600 hover:bg-violet-500 px-6 py-3 font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20">Mint →</Link>
                    </div>
                    {/* Mobile: Hamburger + Mint button */}
                    <div className="flex md:hidden items-center gap-3">
                        <Link href="/mint" className="bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-sm font-medium rounded-md">Mint →</Link>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-black/30 backdrop-blur-xl">
                        <div className="flex flex-col py-4 px-6 space-y-4">
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-2">Home</Link>
                            <Link href="/problem" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Problem</Link>
                            <Link href="/solution" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Solution</Link>
                            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Roadmap</Link>
                            <a href="https://github.com/ushushruth/GhostMint---ZK-NFT-Minting" target="_blank" className="text-zinc-400 hover:text-white py-2">GitHub</a>
                        </div>
                    </div>
                )}
            </nav>

            <section className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pt-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="text-center max-w-4xl">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8 leading-[0.95]">
                        Private NFT
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Minting
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8 md:mb-14 leading-relaxed px-2">
                        Prove you have a valid mint permit without revealing which one.
                        Zero-knowledge proofs Built with <a href="https://noir-lang.org" target="_blank" className="font-semibold text-white hover:text-violet-400 transition-colors">Noir</a> Verified on <a href="https://solana.com" target="_blank" className="font-semibold text-white hover:text-violet-400 transition-colors">Solana</a>.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                        <Link href="/mint" className="w-full sm:w-auto bg-white text-black px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-semibold hover:bg-zinc-100 transition-all hover:shadow-xl hover:shadow-white/10">
                            Start Minting
                        </Link>
                        <a href="https://noir-lang.org/docs" target="_blank" className="w-full sm:w-auto border border-zinc-600 backdrop-blur-sm bg-white/5 px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-medium hover:border-zinc-400 hover:bg-white/10 transition-all text-center">
                            Read Docs
                        </a>
                    </div>
                </div>
                <div className="absolute bottom-10 animate-bounce">
                    <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-zinc-500 rounded-full" />
                    </div>
                </div>
            </section>

            <section ref={featuresRef} className="relative z-10 py-16 md:py-32 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className={`text-3xl md:text-5xl font-bold text-center mb-4 md:mb-6 transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        How Privacy Works
                    </h2>
                    <p className={`text-base md:text-xl text-zinc-500 text-center mb-10 md:mb-20 transition-all duration-700 delay-100 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Powered by zero-knowledge cryptography
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className={`group relative overflow-hidden transition-all duration-700 delay-200 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative border border-white/10 p-10 h-full backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300">
                                <div className="w-14 h-14 border border-violet-500/40 flex items-center justify-center mb-8 backdrop-blur-sm bg-violet-500/10">
                                    <div className="w-6 h-6 bg-violet-400/60 rotate-45" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">Zero Knowledge Proof</h3>
                                <p className="text-lg text-zinc-400 leading-relaxed">
                                    You can prove you own a valid permit from a set of over one million possibilities, without ever revealing which one is yours. It is mathematics, not trust.
                                </p>
                            </div>
                        </div>

                        <div className={`group relative overflow-hidden transition-all duration-700 delay-300 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative border border-white/10 p-10 h-full backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-300">
                                <div className="w-14 h-14 border border-blue-500/40 flex items-center justify-center mb-8 backdrop-blur-sm bg-blue-500/10">
                                    <div className="w-6 h-6 border-2 border-blue-400/60 rounded-full" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">Unlinkable Identity</h3>
                                <p className="text-lg text-zinc-400 leading-relaxed">
                                    Your wallet address stays completely separate from your original allocation. Anyone watching sees that someone valid minted, but they cannot tell who.
                                </p>
                            </div>
                        </div>

                        <div className={`group relative overflow-hidden transition-all duration-700 delay-400 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative border border-white/10 p-10 h-full backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] hover:border-pink-500/30 transition-all duration-300">
                                <div className="w-14 h-14 border border-pink-500/40 flex items-center justify-center mb-8 backdrop-blur-sm bg-pink-500/10">
                                    <div className="w-8 h-[2px] bg-pink-400/60" />
                                    <div className="absolute w-[2px] h-8 bg-pink-400/60" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">Sybil Resistant</h3>
                                <p className="text-lg text-zinc-400 leading-relaxed">
                                    Each permit works exactly once. Our nullifier system makes sure nobody can double-spend, while keeping your identity completely anonymous.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={techRef} className="relative z-10 py-16 md:py-32 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                        <div className={`transition-all duration-700 ${techInView ? 'opacity-100 translate-x-0' : 'opacity-0 md:-translate-x-16'}`}>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8">Built with Noir & Solana</h2>
                            <p className="text-base md:text-xl text-zinc-400 leading-relaxed mb-6 md:mb-10">
                                Noir is a domain-specific language designed for writing zero-knowledge circuits.
                                MintGhost leverages Solana's high-performance blockchain to verify these Groth16 proofs on-chain,
                                enabling privacy-preserving NFT minting with sub-second finality and negligible fees.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                <a href="https://noir-lang.org" target="_blank" className="inline-flex items-center gap-2 text-lg md:text-xl text-violet-400 hover:text-violet-300 transition-colors font-medium">
                                    Learn more about Noir →
                                </a>
                                <a href="https://solana.com" target="_blank" className="inline-flex items-center gap-2 text-lg md:text-xl text-green-400 hover:text-green-300 transition-colors font-medium">
                                    Learn more about Solana →
                                </a>
                            </div>
                        </div>
                        <div className={`transition-all duration-700 delay-200 ${techInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
                            <div className="border border-white/10 backdrop-blur-xl bg-white/[0.03] overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                    <span className="ml-4 text-sm text-zinc-500">main.nr</span>
                                </div>
                                <pre className="p-8 text-base font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                                    {`fn main(
    secret: Field,
    index: u32,
    path: [Field; 20],
    root: pub Field
) {
    let leaf = hash(secret);
    assert(verify_merkle(leaf, index, path, root));
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={useCasesRef} className="relative z-10 py-16 md:py-32 px-4 md:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className={`text-3xl md:text-5xl font-bold mb-10 md:mb-20 transition-all duration-700 ${useCasesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Real World Use Cases
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        {[
                            { title: 'Private NFTs', desc: 'Mint exclusive NFTs without revealing your identity on the allowlist' },
                            { title: 'Anonymous Allowlists', desc: 'Grant VIP access without exposing who your VIPs actually are' },
                            { title: 'Private Voting', desc: 'Let people cast their votes without anyone knowing how they voted' },
                            { title: 'Fair Airdrops', desc: 'One claim per person, no identity checks, no gaming the system' },
                            { title: 'Private Credentials', desc: 'Prove you are qualified without revealing personal details' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`p-6 border border-white/10 backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-700 ${useCasesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                style={{ transitionDelay: `${200 + i * 100}ms` }}
                            >
                                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            <section ref={ctaRef} className="relative z-10 py-20 md:py-40 px-4 md:px-8">
                <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8">Ready to Mint?</h2>
                    <p className="text-lg md:text-2xl text-zinc-400 mb-8 md:mb-12">Enter your secret permit and claim your private NFT.</p>
                    <Link href="/mint" className="inline-block bg-violet-600 hover:bg-violet-500 px-8 md:px-14 py-4 md:py-6 text-lg md:text-2xl font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/20">
                        Launch Minting App →
                    </Link>
                </div>
            </section>

            <footer className="relative z-10 border-t border-white/5 py-8 md:py-12 px-4 md:px-8 backdrop-blur-sm bg-black/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="MintGhost" className="w-8 h-8" />
                        <span className="text-zinc-500 font-medium">MintGhost</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 text-zinc-500 text-sm md:text-base">
                        <span>Noir + Groth16</span>
                        <span>•</span>
                        <span>Solana Devnet</span>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes blob-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(50px, -30px) scale(1.05); }
                    50% { transform: translate(20px, 40px) scale(0.95); }
                    75% { transform: translate(-30px, 20px) scale(1.02); }
                }
                @keyframes blob-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(-40px, 30px) scale(1.03); }
                    50% { transform: translate(30px, -40px) scale(0.97); }
                    75% { transform: translate(20px, 50px) scale(1.05); }
                }
                @keyframes blob-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-60px, -20px) scale(1.08); }
                    66% { transform: translate(40px, 30px) scale(0.92); }
                }
                .animate-blob-1 { animation: blob-1 20s ease-in-out infinite; }
                .animate-blob-2 { animation: blob-2 25s ease-in-out infinite; }
                .animate-blob-3 { animation: blob-3 18s ease-in-out infinite; }
            `}</style>
        </main>
    );
}

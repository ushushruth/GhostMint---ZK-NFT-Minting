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

export default function SolutionPage() {
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const flowRef = useRef<HTMLDivElement>(null);
    const flowInView = useInView(flowRef);

    useEffect(() => {
        setMounted(true);
    }, []);

    const steps = [
        { title: '1. Connect Wallet', desc: 'User connects their wallet to the dApp. Basic interaction start.', side: 'left' },
        { title: '2. Generate Secret', desc: 'A cryptographic secret is generated locally in the browser. It never leaves the user device.', side: 'right' },
        { title: '3. Construct Merkle Path', desc: 'The client fetches the Merkle path for the permit, proving existence in the allowlist set.', side: 'left' },
        { title: '4. Generate Proof (Noir)', desc: 'Noir generates a Zero-Knowledge Proof that the secret corresponds to a valid set member.', side: 'right' },
        { title: '5. Submit Transaction', desc: 'The proof is submitted to the Solana blockchain. No identity or index is revealed.', side: 'left' },
        { title: '6. Verify & Mint', desc: 'The Verifier contract checks the proof on-chain and mints the NFT to a fresh address.', side: 'right' },
    ];

    return (
        <main className="min-h-screen bg-[#050508] text-white overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-[-20%] right-[10%] w-[700px] h-[700px] rounded-full animate-blob-2"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)', filter: 'blur(60px)' }} />
            </div>

            <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-5">
                    <Link href="/" className="flex items-center gap-2 md:gap-4">
                        <img src="/logo.png" alt="MintGhost" className="w-7 h-7 md:w-10 md:h-10" />
                        <span className="text-base md:text-xl font-semibold tracking-tight">MintGhost</span>
                    </Link>
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/" className="text-base text-zinc-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/problem" className="text-base text-zinc-400 hover:text-white transition-colors">Problem</Link>
                        <Link href="/solution" className="text-white font-medium text-base">Solution</Link>
                        <Link href="/roadmap" className="text-base text-zinc-400 hover:text-white transition-colors">Roadmap</Link>
                        <Link href="/mint" className="bg-violet-600 hover:bg-violet-500 px-6 py-3 font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20">Mint →</Link>
                    </div>
                    {/* Mobile: Hamburger + Mint */}
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
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Home</Link>
                            <Link href="/problem" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Problem</Link>
                            <Link href="/solution" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-2">Solution</Link>
                            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Roadmap</Link>
                        </div>
                    </div>
                )}
            </nav>

            <section ref={flowRef} className="relative z-10 py-20 md:py-32 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className={`text-3xl md:text-7xl font-bold text-center mb-10 md:mb-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Our <span className="text-violet-400">Solution</span>
                    </h1>

                    <div className="relative">
                        {/* Connecting Line (Mobile: straight vertical line on left) */}
                        <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/30 via-pink-500/30 to-blue-500/30 md:hidden"></div>

                        {steps.map((step, i) => (
                            <div key={i} className={`relative flex flex-col md:flex-row items-start md:items-center mb-6 md:mb-32 transition-all duration-700 ${flowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 100}ms` }}>

                                {/* Mobile: Step indicator dot */}
                                <div className="md:hidden absolute left-3 top-5 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 z-10 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>

                                {/* Mobile: Card (always renders for both left/right steps) */}
                                <div className="md:hidden ml-10 w-full pr-2">
                                    <div className={`bg-zinc-900/50 border border-white/10 p-4 rounded-xl ${step.side === 'left' ? 'border-l-2 border-l-violet-500' : 'border-l-2 border-l-pink-500'}`}>
                                        <h3 className={`text-base font-bold mb-1 ${step.side === 'left' ? 'text-violet-400' : 'text-pink-400'}`}>{step.title}</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>

                                {/* Desktop: Left Side Content */}
                                <div className="hidden md:block w-1/2 px-12 text-right">
                                    {step.side === 'left' && (
                                        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl relative group hover:border-violet-500/30 transition-all z-20">
                                            <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-violet-500 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
                                            <h3 className="text-2xl font-bold text-violet-400 mb-2">{step.title}</h3>
                                            <p className="text-zinc-400">{step.desc}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop: Center Spacer */}
                                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-10"></div>

                                {/* Desktop: Right Side Content */}
                                <div className="hidden md:block w-1/2 px-12">
                                    {step.side === 'right' && (
                                        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl relative group hover:border-pink-500/30 transition-all z-20">
                                            <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-pink-500 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                                            <h3 className="text-2xl font-bold text-pink-400 mb-2">{step.title}</h3>
                                            <p className="text-zinc-400">{step.desc}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Connecting Arrow (if not last step) */}
                                {i < steps.length - 1 && (
                                    <svg className="hidden md:block absolute left-0 w-full h-[320px] overflow-visible pointer-events-none z-30" style={{ top: '50%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                                                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(139, 92, 246, 0.4)" />
                                            </marker>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
                                                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.6)" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d={step.side === 'left'
                                                ? "M 45.3 0 C 45.3 50, 54.7 50, 54.7 98"
                                                : "M 54.7 0 C 54.7 50, 45.3 50, 45.3 98"}
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            vectorEffect="non-scaling-stroke"
                                            fill="none"
                                            className="drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                                            markerEnd="url(#arrowhead)"
                                        />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={`mt-6 md:mt-10 text-center transition-all duration-700 delay-700 ${flowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <Link href="/mint" className="inline-block bg-white text-black px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-bold hover:bg-zinc-200 transition-all hover:scale-105 transform">
                            Start Minting Now
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

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

function RoadmapItem({ item, index }: { item: any, index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, 0.2);

    return (
        <div
            ref={ref}
            className={`relative flex flex-col md:flex-row items-center mb-8 md:mb-16 transition-all duration-700 transform ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'}`}
            style={{ transitionDelay: `${index % 2 * 100}ms` }} // Minor stagger for side-by-side or rapid scroll
        >
            <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'md:pr-16 md:text-right' : 'md:pl-16 md:order-2'}`}>
                <div className={`relative group border ${item.borderColor} backdrop-blur-xl bg-gradient-to-br ${item.gradient} p-6 md:p-8 hover:scale-[1.02] transition-all duration-500 shadow-xl ${item.glowColor}`}>

                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />

                    <div className="relative">
                        <div className={`flex items-center gap-3 mb-4 ${item.side === 'left' ? 'md:justify-end' : ''}`}>
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-base text-violet-400 font-mono font-bold">{item.quarter}</span>
                            <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${item.status === 'Live' ? 'bg-green-500/30 text-green-300 border border-green-400/50 animate-pulse' :
                                item.status === 'Building' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' :
                                    item.status === 'Planned' ? 'bg-violet-500/30 text-violet-300 border border-violet-400/50' :
                                        'bg-pink-500/30 text-pink-300 border border-pink-400/50'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-bold mb-3">{item.title}</h3>
                        <p className="text-base md:text-lg text-zinc-300 mb-6 font-medium">{item.desc}</p>
                        <ul className={`space-y-3 ${item.side === 'left' ? 'md:text-right' : ''}`}>
                            {item.items.map((bullet: string, j: number) => (
                                <li key={j} className={`text-sm md:text-base text-zinc-400 flex items-center gap-3 ${item.side === 'left' ? 'md:flex-row-reverse' : ''}`}>
                                    <span className="w-2 h-2 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full flex-shrink-0" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                        {item.connection && (
                            <div className={`mt-6 pt-4 border-t border-white/10 ${item.side === 'left' ? 'md:text-right' : ''}`}>
                                <p className="text-sm text-violet-400 font-semibold">
                                    {item.connection}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 items-center justify-center shadow-xl shadow-violet-500/50 z-10">
                <div className={`w-4 h-4 rounded-full bg-white/90 transition-all duration-500 ${inView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            </div>

            <div className={`hidden md:block w-1/2 ${item.side === 'left' ? 'md:order-2' : ''}`} />
        </div>
    );
}

export default function RoadmapPage() {
    const [mounted, setMounted] = useState(false);
    const roadmapRef = useRef<HTMLDivElement>(null);
    const roadmapInView = useInView(roadmapRef);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="min-h-screen bg-[#050508] text-white overflow-hidden">

            {/* Liquid glass background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full animate-blob-1"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full animate-blob-2"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)', filter: 'blur(80px)' }} />
                <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full animate-blob-3"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            </div>


            {/* Noise texture */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />


            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
                    <Link href="/" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MintGhost" className="w-8 h-8 md:w-10 md:h-10" />
                        <span className="text-lg md:text-xl font-semibold tracking-tight">MintGhost</span>
                    </Link>
                    <div className="flex items-center gap-4 md:gap-10">
                        <Link href="/" className="text-sm md:text-base text-zinc-400 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/problem" className="text-sm md:text-base text-zinc-400 hover:text-white transition-colors">
                            Problem
                        </Link>
                        <Link href="/solution" className="text-sm md:text-base text-zinc-400 hover:text-white transition-colors">
                            Solution
                        </Link>
                        <Link href="/roadmap" className="text-white font-medium text-sm md:text-base">
                            Roadmap
                        </Link>
                        <a href="https://github.com/ushushruth/GhostMint---ZK-NFT-Minting" target="_blank" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
                            GitHub
                        </a>
                        <Link href="/mint" className="hidden md:block bg-violet-600 hover:bg-violet-500 px-6 py-3 font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20">
                            Launch App →
                        </Link>
                    </div>
                    <Link href="/mint" className="md:hidden bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium rounded-lg">
                        Mint →
                    </Link>
                </div>
            </nav>


            {/* Hero */}
            <section className={`relative z-10 pt-32 md:pt-40 pb-12 md:pb-20 px-4 md:px-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
                        The <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Privacy Stack</span>
                        <br />Roadmap
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        From NFT minting to a complete privacy infrastructure for Web3
                    </p>
                    <p className="text-sm md:text-base text-zinc-600 mt-4 max-w-3xl mx-auto">
                        Each phase builds upon the last — the same ZK proving system powering MintGhost today will evolve into a universal privacy layer
                    </p>
                </div>
            </section>


            {/* Roadmap */}
            <section ref={roadmapRef} className="relative z-10 py-8 md:py-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="relative">

                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 hidden md:block">
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500 via-violet-500 to-pink-500/30 rounded-full" />
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500 via-violet-500 to-pink-500/30 rounded-full blur-md opacity-50" />
                        </div>

                        {[
                            {
                                quarter: 'Q1 2025',
                                side: 'left',
                                title: 'MintGhost Core',
                                status: 'Live',
                                icon: '◆',
                                gradient: 'from-green-500/20 to-emerald-500/5',
                                borderColor: 'border-green-500/40',
                                glowColor: 'shadow-green-500/30',
                                desc: 'The foundation is live. Noir circuits + Groth16 proofs on Solana.',
                                items: ['Noir ZK circuit for private eligibility', 'Sunspot Groth16 prover integration', 'On-chain verification in Solana program', 'Anonymous NFT minting flow', 'Pre-generated proof system'],
                                connection: 'This proving system becomes the backbone →'
                            },
                            {
                                quarter: 'Q2 2025',
                                side: 'right',
                                title: 'Ghost SDK',
                                status: 'Building',
                                icon: '⬡',
                                gradient: 'from-blue-500/20 to-cyan-500/5',
                                borderColor: 'border-blue-500/40',
                                glowColor: 'shadow-blue-500/30',
                                desc: 'Modular SDK for any app to add ZK privacy.',
                                items: ['TypeScript/Rust SDK packages', 'Plug-and-play Noir circuit templates', 'React hooks for wallet + proof flow', 'Developer documentation & examples', 'NPM package distribution'],
                                connection: 'Enables rapid development of →'
                            },
                            {
                                quarter: 'Q3 2025',
                                side: 'left',
                                title: 'GhostDAO',
                                status: 'Planned',
                                icon: '◈',
                                gradient: 'from-violet-500/20 to-purple-500/5',
                                borderColor: 'border-violet-500/40',
                                glowColor: 'shadow-violet-500/30',
                                desc: 'First production app built on Ghost SDK — anonymous governance.',
                                items: ['Private proposal creation & voting', 'ZK-verified membership tiers', 'Anonymous delegation system', 'Shielded treasury operations', 'Multi-sig with hidden signers'],
                                connection: 'Proving governance extends to →'
                            },
                            {
                                quarter: 'Q4 2025',
                                side: 'right',
                                title: 'Privacy Ecosystem',
                                status: 'Vision',
                                icon: '✧',
                                gradient: 'from-pink-500/20 to-rose-500/5',
                                borderColor: 'border-pink-500/40',
                                glowColor: 'shadow-pink-500/30',
                                desc: 'Full privacy stack for any on-chain application.',
                                items: ['Private DeFi: anonymous swaps & lending', 'ZK credentials for real-world identity', 'Cross-chain private bridges', 'Enterprise privacy solutions', 'Mainnet deployment & audits'],
                                connection: null
                            },
                        ].map((item, i) => (
                            <RoadmapItem key={i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA */}
            <section className="relative z-10 py-16 md:py-24 px-4 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Start with MintGhost Today</h2>
                    <p className="text-lg md:text-xl text-zinc-400 mb-10">Experience the first step of the privacy stack — private NFT minting on Solana.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/mint" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 px-10 py-5 text-lg font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/20">
                            Launch Minting App →
                        </Link>
                        <a href="https://github.com/ushushruth/GhostMint---ZK-NFT-Minting" target="_blank" className="w-full sm:w-auto border border-zinc-600 backdrop-blur-sm bg-white/5 px-10 py-5 text-lg font-medium hover:border-zinc-400 hover:bg-white/10 transition-all text-center">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 md:py-12 px-4 md:px-8 backdrop-blur-sm bg-black/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="MintGhost" className="w-8 h-8" />
                        <span className="text-zinc-500 font-medium">MintGhost</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 text-zinc-500 text-sm md:text-base">
                        <a href="https://noir-lang.org" target="_blank" className="hover:text-zinc-300 transition-colors">Noir + Groth16</a>
                        <span>•</span>
                        <a href="https://solana.com" target="_blank" className="hover:text-zinc-300 transition-colors">Solana Devnet</a>
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

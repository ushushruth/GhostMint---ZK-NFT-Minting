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

export default function ProblemPage() {
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const problemRef = useRef<HTMLDivElement>(null);
    const problemInView = useInView(problemRef);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="min-h-screen bg-[#050508] text-white overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full animate-blob-1"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)', filter: 'blur(60px)' }} />
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
                        <Link href="/problem" className="text-white font-medium text-base">Problem</Link>
                        <Link href="/solution" className="text-base text-zinc-400 hover:text-white transition-colors">Solution</Link>
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
                            <Link href="/problem" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-2">Problem</Link>
                            <Link href="/solution" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Solution</Link>
                            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Roadmap</Link>
                        </div>
                    </div>
                )}
            </nav>

            <section ref={problemRef} className="relative z-10 py-20 md:py-32 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className={`text-3xl md:text-7xl font-bold text-center mb-8 md:mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        The <span className="text-red-500">Problem</span>
                    </h1>
                    <p className={`text-base md:text-xl text-zinc-400 text-center max-w-3xl mx-auto mb-10 md:mb-20 leading-relaxed transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Public blockchains are transparent by design. While this ensures trust, it destroys privacy.
                        Every transaction, balance, and interaction is visible to the entire world.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {[
                            { title: 'Total Transparency', desc: 'Your wallet balance and entire transaction history are public record. Anyone can see exactly how much you own and where you send it.' },
                            { title: 'Identity Linking', desc: 'Once your wallet is doxxed (e.g. by sending from an exchange), your entire financial life is linked to your real-world identity forever.' },
                            { title: 'Front-Running (MEV)', desc: 'Bots monitor the mempool for profitable transactions. Because your trade details are public before confirmation, they can extract value from you.' },
                            { title: 'Data Harvesting', desc: 'Companies analyze blockchain data to build profiles on users, tracking their behavior and financial status without consent.' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`p-5 md:p-10 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-red-500/30 transition-all duration-700 ${problemInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4 text-red-400">{item.title}</h3>
                                <p className="text-zinc-400 text-sm md:text-lg leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`mt-10 md:mt-20 text-center transition-all duration-700 delay-500 ${problemInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <Link href="/solution" className="inline-block border border-white/10 hover:border-violet-500 hover:bg-violet-500/10 px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-medium transition-all">
                            See The Solution →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

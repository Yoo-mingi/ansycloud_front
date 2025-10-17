import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1419]">
      <main className="w-full max-w-7xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3b82f6] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            </div>

            <div className="relative bg-[#1a1f2e] border border-[#2d3748] rounded-2xl p-12">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-[#e4e6eb] mb-6">
                    <span className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
                      Pipeline Automation
                    </span>
                    <br />
                    Simplified
                  </h1>
                  <p className="text-[#9ca3af] text-lg mb-8 leading-relaxed">
                    AnsyCloud is an open-source pipeline automation platform that brings the power of Jenkins to the cloud. 
                    Manage, automate, and deploy your infrastructure with ease.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/script"
                      className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] text-white font-semibold rounded-lg transition transform hover:scale-105"
                    >
                      Explore Scripts
                    </Link>
                    <Link
                      href="/community"
                      className="px-6 py-3 border border-[#2d3748] text-[#3b82f6] hover:bg-[#252d3d] font-semibold rounded-lg transition"
                    >
                      Join Community
                    </Link>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <div className="w-full aspect-square bg-gradient-to-br from-[#3b82f6]/20 to-[#06b6d4]/20 rounded-xl border border-[#2d3748] flex items-center justify-center">
                    <svg className="w-48 h-48 text-[#3b82f6] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#e4e6eb] mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 hover:border-[#3b82f6] hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Automation</h3>
              <p className="text-[#9ca3af]">Automate repetitive tasks and pipelines with ease.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 hover:border-[#06b6d4] hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#06b6d4]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Configuration</h3>
              <p className="text-[#9ca3af]">Manage multiple sites and configurations effortlessly.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 hover:border-[#10b981] hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#10b981]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Collaboration</h3>
              <p className="text-[#9ca3af]">Share scripts and knowledge with your team.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 hover:border-[#f59e0b] hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Reliability</h3>
              <p className="text-[#9ca3af]">Enterprise-grade reliability and security.</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-[#e4e6eb] mb-8">Getting Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Create a Site</h3>
                <p className="text-[#9ca3af]">Set up your first site to organize infrastructure by project or environment.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#10b981] flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Connect Agents</h3>
                <p className="text-[#9ca3af]">Connect your master nodes and slave servers to the platform.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10b981] to-[#f59e0b] flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e4e6eb] mb-2">Deploy Scripts</h3>
                <p className="text-[#9ca3af]">Use community scripts or create your own automation workflows.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-[#9ca3af] text-lg mb-6">Ready to revolutionize your infrastructure automation?</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#1e40af] hover:to-[#0891b2] text-white font-semibold rounded-lg transition transform hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </main>
    </div>
  );
}

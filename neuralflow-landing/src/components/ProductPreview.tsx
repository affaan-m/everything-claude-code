'use client';

export default function ProductPreview() {
  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
            Powerful workflow automation
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See how NeuralFlow connects your tools and automates complex processes with AI intelligence.
          </p>
        </div>

        {/* Product Preview Card */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            {/* Mock Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                <div>
                  <h3 className="text-white font-medium">Workflow Dashboard</h3>
                  <p className="text-gray-400 text-sm">3 active automations</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Mock Workflow Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Node 1 */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">G</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Google Sheets</h4>
                    <p className="text-gray-400 text-sm">Data Source</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Last updated: 2 min ago</div>
              </div>

              {/* Node 2 */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">AI Processor</h4>
                    <p className="text-gray-400 text-sm">Analysis & Action</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Processing: 45 records</div>
              </div>

              {/* Node 3 */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Slack</h4>
                    <p className="text-gray-400 text-sm">Notification</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Sent: 12 notifications</div>
              </div>
            </div>

            {/* Connection Lines (Visual) */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-green-500"></div>
              </div>
            </div>
          </div>

          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
}
'use client';

import {
  Zap,
  Puzzle,
  Brain,
  FileText,
  Users,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Visual Builder',
    description: 'Drag-and-drop interface to create complex workflows without coding.'
  },
  {
    icon: Puzzle,
    title: '100+ Integrations',
    description: 'Connect with your favorite tools including Slack, Google Workspace, and more.'
  },
  {
    icon: Brain,
    title: 'AI Actions',
    description: 'Leverage AI to analyze data, make decisions, and automate intelligent responses.'
  },
  {
    icon: FileText,
    title: 'Real-time Logs',
    description: 'Monitor your automations with detailed logs and performance metrics.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share workflows with your team and collaborate on automation projects.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with SOC 2 compliance and end-to-end encryption.'
  }
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
            Everything you need to automate
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features designed to make workflow automation simple, secure, and intelligent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
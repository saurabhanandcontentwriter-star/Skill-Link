import React, { useMemo, useState } from 'react';

const communicationChannels = [
  {
    id: 'voice-link',
    title: 'Auto-Pilot Voice Link',
    description: 'Issue hands-free commands and receive spoken status updates.',
    status: 'Online',
    statusTone: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 'crew-broadcast',
    title: 'Crew Broadcast',
    description: 'Send group updates to every device on the boat.',
    status: 'Standby',
    statusTone: 'bg-yellow-500/20 text-yellow-300',
  },
  {
    id: 'sos-relay',
    title: 'Emergency SOS Relay',
    description: 'One-tap distress alerts with live location sharing.',
    status: 'Ready',
    statusTone: 'bg-red-500/20 text-red-300',
  },
];

const AiBoatCommunications: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState(communicationChannels[0].id);
  const [draftMessage, setDraftMessage] = useState('');
  const [logEntries, setLogEntries] = useState([
    {
      id: 'log-1',
      author: 'AI Bot',
      tone: 'text-aqua-green',
      message: 'Engine check complete. Battery at 92%. Ready for departure.',
    },
    {
      id: 'log-2',
      author: 'Captain',
      tone: 'text-electric-blue',
      message: 'Confirm safe channel to harbor control and broadcast ETA.',
    },
    {
      id: 'log-3',
      author: 'Harbor',
      tone: 'text-neon-purple',
      message: 'Dock 4 reserved. Maintain 12 knots until marker buoy.',
    },
  ]);

  const activeChannelLabel = useMemo(
    () => communicationChannels.find((channel) => channel.id === activeChannel)?.title ?? 'Crew Broadcast',
    [activeChannel]
  );

  const handleSend = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    setLogEntries((prev) => [
      {
        id: `log-${Date.now()}`,
        author: 'Operator',
        tone: 'text-white',
        message: `[${activeChannelLabel}] ${trimmed}`,
      },
      ...prev,
    ]);
    setDraftMessage('');
  };

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-electric-blue font-semibold">AI Boat</p>
          <h2 className="text-3xl font-bold text-white mt-2">AI Boat Communication Console</h2>
          <p className="text-muted-gray mt-3 max-w-2xl">
            Design a reliable AI bot that keeps every crew member connected. The console below simulates
            voice commands, broadcast messages, and emergency coordination in one place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="px-6 py-3 rounded-xl bg-electric-blue text-white font-semibold shadow-lg shadow-electric-blue/30 hover:scale-105 active:scale-95 transition"
            onClick={() => setActiveChannel('crew-broadcast')}
          >
            Start Communication
          </button>
          <button
            className="px-6 py-3 rounded-xl border border-slate-700 text-white/80 hover:text-white hover:border-electric-blue/60 transition"
            onClick={() => setActiveChannel('sos-relay')}
          >
            Schedule Drill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {communicationChannels.map((channel) => (
          <div
            key={channel.title}
            className={`bg-slate-800/60 border rounded-xl p-5 flex flex-col gap-3 transition hover:border-electric-blue/60 ${
              activeChannel === channel.id ? 'border-electric-blue/60' : 'border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{channel.title}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${channel.statusTone}`}>
                {channel.status}
              </span>
            </div>
            <p className="text-sm text-muted-gray">{channel.description}</p>
            <button
              type="button"
              onClick={() => setActiveChannel(channel.id)}
              className="mt-2 text-xs font-semibold text-electric-blue hover:text-white transition"
            >
              {activeChannel === channel.id ? 'Channel Active' : 'Switch to Channel'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/70 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Live Communication Log</h3>
            <span className="text-xs text-muted-gray">Channel: {activeChannelLabel}</span>
          </div>
          <div className="space-y-3 text-sm max-h-56 overflow-y-auto pr-2">
            {logEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <span className={`${entry.tone} font-semibold`}>{entry.author}:</span>
                <p className="text-white/90">{entry.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={`Send a ${activeChannelLabel} update...`}
              className="flex-1 rounded-lg bg-slate-900/70 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-electric-blue"
            />
            <button
              type="button"
              onClick={handleSend}
              className="px-5 py-2 rounded-lg bg-aqua-green text-dark-slate font-semibold hover:scale-105 active:scale-95 transition"
            >
              Transmit
            </button>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-gray">Signal Health</p>
            <p className="text-2xl font-bold text-white mt-1">92%</p>
            <p className="text-sm text-muted-gray">Stabilized across 3 relays</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-gray">Encryption</p>
            <p className="text-lg font-semibold text-white mt-1">AES-256 Secure</p>
            <p className="text-sm text-muted-gray">Key rotation every 15 min</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-gray">Priority Routing</p>
            <p className="text-lg font-semibold text-white mt-1">Emergency &gt; Voice &gt; Broadcast</p>
            <p className="text-sm text-muted-gray">Latency 120ms</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiBoatCommunications;

import { useCallback, useMemo } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Palette, Eye, Settings as SettingsIcon, Volume2, Bell } from "lucide-react";

/**
 * Preview messages for theme demonstration
 */
const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

/**
 * Theme color palette display
 */
const ThemeCard = ({ theme, isActive, onClick }) => {
  const themeDisplayName = theme.charAt(0).toUpperCase() + theme.slice(1);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "ring-2 ring-offset-2 ring-purple-600 bg-gray-100"
          : "hover:bg-gray-100 hover:ring-1 hover:ring-gray-300"
      }`}
      aria-pressed={isActive}
      title={themeDisplayName}
    >
      <div className="relative h-10 w-20 rounded-lg overflow-hidden shadow-sm" data-theme={theme}>
        <div className="absolute inset-0 grid grid-cols-4 gap-px p-1.5">
          <div className="rounded bg-primary" />
          <div className="rounded bg-secondary" />
          <div className="rounded bg-accent" />
          <div className="rounded bg-neutral" />
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">
        {themeDisplayName}
      </span>
    </button>
  );
};

/**
 * Chat message bubble component
 */
const ChatBubble = ({ message, isSent }) => (
  <div className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-sm ${
        isSent
          ? "bg-primary text-primary-content rounded-br-none"
          : "bg-base-200 text-base-content rounded-bl-none"
      }`}
    >
      <p className="text-sm">{message.content}</p>
      <p
        className={`text-xs mt-1 opacity-70 ${
          isSent ? "text-primary-content" : "text-base-content"
        }`}
      >
        12:00 PM
      </p>
    </div>
  </div>
);

/**
 * Settings section header
 */
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2 bg-purple-100 rounded-lg">
      <Icon className="w-6 h-6 text-purple-600" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

/**
 * Settings toggle component
 */
const SettingToggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <input
      type="checkbox"
      checked={enabled}
      onChange={onChange}
      className="w-5 h-5 rounded cursor-pointer accent-purple-600"
    />
  </div>
);

/**
 * Main settings page component
 */
const SettingPage = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = useCallback(
    (newTheme) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const availableThemes = useMemo(() => THEMES || [], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your QuickMeet experience</p>
        </div>

        <div className="space-y-8">
          {/* ── THEME SECTION ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <SectionHeader
              icon={Palette}
              title="Appearance"
              description="Customize how QuickMeet looks for you"
            />

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {availableThemes.map((t) => (
                <ThemeCard
                  key={t}
                  theme={t}
                  isActive={theme === t}
                  onClick={() => handleThemeChange(t)}
                />
              ))}
            </div>
          </div>

          {/* ── PREVIEW SECTION ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <SectionHeader
              icon={Eye}
              title="Preview"
              description="See how your theme looks in action"
            />

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-base-100">
              <div className="p-4 bg-base-200">
                <div className="max-w-lg mx-auto">
                  {/* Chat mockup */}
                  <div className="bg-base-100 rounded-xl shadow-md overflow-hidden">
                    {/* Chat header */}
                    <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold text-sm">
                          JD
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-base-content">John Doe</h3>
                          <p className="text-xs text-base-content/70">Online</p>
                        </div>
                        <SettingsIcon className="w-5 h-5 text-base-content/60" />
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                      {PREVIEW_MESSAGES.map((message) => (
                        <ChatBubble
                          key={message.id}
                          message={message}
                          isSent={message.isSent}
                        />
                      ))}
                    </div>

                    {/* Chat input */}
                    <div className="p-4 border-t border-base-300 bg-base-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1 text-sm h-10"
                          placeholder="Type a message..."
                          value="This is a preview"
                          readOnly
                        />
                        <button className="btn btn-primary h-10 min-h-0 px-3">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── NOTIFICATIONS SECTION ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <SectionHeader
              icon={Bell}
              title="Notifications"
              description="Control how you receive notifications"
            />

            <div className="space-y-3">
              <SettingToggle
                label="Message Notifications"
                description="Receive alerts for new messages"
                enabled={true}
                onChange={() => {}}
              />
              <SettingToggle
                label="Meeting Reminders"
                description="Get reminded about upcoming meetings"
                enabled={true}
                onChange={() => {}}
              />
              <SettingToggle
                label="Email Notifications"
                description="Receive notifications via email"
                enabled={false}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* ── AUDIO SETTINGS SECTION ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <SectionHeader
              icon={Volume2}
              title="Audio & Video"
              description="Adjust your media preferences"
            />

            <div className="space-y-3">
              <SettingToggle
                label="Auto-join with mic muted"
                description="Start meetings with microphone off by default"
                enabled={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="Auto-join with camera off"
                description="Start meetings with camera off by default"
                enabled={false}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-sm text-gray-600 pb-8">
            <p>Settings are saved automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;

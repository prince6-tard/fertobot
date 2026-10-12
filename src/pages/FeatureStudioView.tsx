import React, { useState, useRef } from 'react';
import { CustomFeature, FeatureComment, User } from '../types';
import {
  Sparkles,
  Pin,
  PinOff,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Send,
  Mail,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  UploadCloud,
  X,
  Maximize2,
  Paperclip
} from 'lucide-react';
import {
  publishFeatureToCloud,
  publishCommentToCloud,
  sendFeatureEmailNotification,
  sendCommentEmailNotification
} from '../services/syncService';

interface FeatureStudioViewProps {
  customFeatures: CustomFeature[];
  setCustomFeatures: React.Dispatch<React.SetStateAction<CustomFeature[]>>;
  user: User;
}

/**
 * Compresses an image file in-browser to a lightweight base64 JPEG
 * for ultra-fast cloud synchronization and email attachments (<80KB).
 */
function compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export const FeatureStudioView: React.FC<FeatureStudioViewProps> = ({
  customFeatures,
  setCustomFeatures,
  user,
}) => {
  // New Feature Form State
  const [typedTitle, setTypedTitle] = useState('');
  const [typedPrompt, setTypedPrompt] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // File input ref for main screenshot
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments state: open state, input text, and attached screenshot per feature
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentScreenshots, setCommentScreenshots] = useState<Record<string, string | null>>({});
  const [isSendingComment, setIsSendingComment] = useState<Record<string, boolean>>({});

  // Lightbox / Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Handle main screenshot file selection
  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setScreenshot(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressing(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle drag & drop screenshot
  const handleDropScreenshot = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setScreenshot(compressed);
    } catch (err) {
      console.error('Failed to process dropped image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle comment screenshot attachment
  const handleCommentScreenshotChange = async (featureId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 0.7);
      setCommentScreenshots((prev) => ({ ...prev, [featureId]: compressed }));
    } catch (err) {
      console.error('Failed to process comment image:', err);
    }
  };

  // Submit New Feature
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedTitle.trim()) return;

    setIsSubmitting(true);

    const newFeat: CustomFeature = {
      id: `FEAT-${Date.now()}`,
      title: typedTitle.trim(),
      userPrompt: typedPrompt.trim() || typedTitle.trim(),
      category: 'Feature Request',
      status: 'live',
      priority: 'Must-Have',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar || (user.id.includes('PRINCE') ? '👨‍🌾' : '🌾')
      },
      pinnedToDashboard: true,
      widgetType: 'toggle_switch',
      currentValue: true,
      unit: 'Active',
      metricLabel: 'Report Logged & Monitored',
      summary: typedPrompt.trim() || `Reported by ${user.name}: "${typedTitle.trim()}"`,
      interactiveOptions: ['Acknowledge Report', 'Investigate', 'Mark Resolved'],
      comments: [],
      screenshot: screenshot || undefined
    };

    // 1. Update local state
    setCustomFeatures((prev) => [newFeat, ...prev]);

    // 2. Broadcast to Friend via Cloud Pub/Sub
    publishFeatureToCloud(newFeat, user);

    // 3. Dispatch Email to priyanshutiwari1010@gmail.com with screenshot
    sendFeatureEmailNotification(newFeat, user);

    // Reset Form
    setTypedTitle('');
    setTypedPrompt('');
    setScreenshot(null);
    setIsSubmitting(false);

    setNotice(`Feature "${newFeat.title}" created, synced live to your friend, and emailed with screenshot to priyanshutiwari1010@gmail.com.`);
    setTimeout(() => setNotice(null), 6000);
  };

  const togglePin = (id: string) => {
    setCustomFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pinnedToDashboard: !f.pinnedToDashboard } : f))
    );
  };

  const deleteFeature = (id: string) => {
    setCustomFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleComments = (featureId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  // Submit Feedback / Comment on existing feature
  const handleAddComment = async (featureId: string, featureTitle: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = (commentInputs[featureId] || '').trim();
    const commentScreenshot = commentScreenshots[featureId] || null;

    if (!commentText && !commentScreenshot) return;

    setIsSendingComment((prev) => ({ ...prev, [featureId]: true }));

    const newComment: FeatureComment = {
      id: `CMT-${Date.now()}`,
      featureId,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatar || (user.id.includes('PRINCE') ? '👨‍🌾' : '🌾'),
      text: commentText || 'Attached screenshot explanation.',
      createdAt: 'Just now',
      screenshot: commentScreenshot || undefined
    };

    // Update local feature comments
    setCustomFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          return {
            ...f,
            comments: [...(f.comments || []), newComment]
          };
        }
        return f;
      })
    );

    // Clear comment inputs
    setCommentInputs((prev) => ({ ...prev, [featureId]: '' }));
    setCommentScreenshots((prev) => ({ ...prev, [featureId]: null }));
    setIsSendingComment((prev) => ({ ...prev, [featureId]: false }));

    // Sync to cloud topic and notify via email (with screenshot)
    publishCommentToCloud(newComment, featureTitle, user);
    sendCommentEmailNotification(newComment, featureTitle, user);

    setNotice(`Feedback on "${featureTitle}" synced and emailed with screenshot to priyanshutiwari1010@gmail.com.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredFeatures = customFeatures.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.title.toLowerCase().includes(term) ||
      (f.userPrompt && f.userPrompt.toLowerCase().includes(term)) ||
      (f.createdBy && f.createdBy.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEATURE & ISSUE STUDIO</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live Cloud Sync Active</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px] font-mono">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>Alerts to: priyanshutiwari1010@gmail.com</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Feature Requests & Screenshot Feedback
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-1">
            Add any feature heading, explain what's wrong or what's needed, and upload screenshots.
            When your friend uploads or comments, an instant email alert is sent to your inbox.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0A0E13] p-3 rounded-xl border border-slate-800 text-xs shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-white font-mono">{customFeatures.length}</div>
            <div className="text-[10px] text-slate-500 uppercase">Features</div>
          </div>
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {customFeatures.filter((f) => f.pinnedToDashboard).length}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Pinned</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-blue-400 font-mono">
              {customFeatures.reduce((acc, f) => acc + (f.comments?.length || 0), 0)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Comments</div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Clean Feature Creation Form */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Add Feature / Report What's Wrong</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Posting as: <strong className="text-emerald-400">{user.name}</strong> ({user.role})
          </span>
        </div>

        <form onSubmit={handleCreateFeature} className="space-y-4">
          {/* Feature Heading */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Feature Heading / Issue Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={typedTitle}
              onChange={(e) => setTypedTitle(e.target.value)}
              placeholder="e.g. Drone Camera Perimeter Glitch, Soil Salinity Graph, or Auto-Dosing Pump"
              className="w-full px-3.5 py-2.5 bg-[#0D131A] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Comment / Explanation Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Comment / Explain What's Wrong or What's Needed
            </label>
            <textarea
              value={typedPrompt}
              onChange={(e) => setTypedPrompt(e.target.value)}
              rows={3}
              placeholder="Explain what's wrong with this feature, what steps reproduce it, or how you would like it improved..."
              className="w-full px-3.5 py-2.5 bg-[#0D131A] border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 resize-none outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* Screenshot Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Screenshot of Feature / Issue</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">PNG, JPG, WebP supported</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleScreenshotChange}
              className="hidden"
            />

            {screenshot ? (
              /* Screenshot Preview with Remove */
              <div className="p-3 rounded-xl bg-[#0A0E13] border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    onClick={() => setZoomedImage(screenshot)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 cursor-pointer group"
                    title="Click to zoom screenshot"
                  >
                    <img
                      src={screenshot}
                      alt="Uploaded screenshot preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Screenshot Attached</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ready to be sent with email notification to priyanshutiwari1010@gmail.com
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomedImage(screenshot)}
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>View Full Image</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScreenshot(null)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            ) : (
              /* Dropzone Upload Button */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropScreenshot}
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 transition-colors cursor-pointer text-center group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800/80 group-hover:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                  {isCompressing ? (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-300">
                    {isCompressing ? 'Compressing image...' : 'Click to browse or drop screenshot here'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Upload any screenshot explaining what's wrong with the feature
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Will automatically email <strong>priyanshutiwari1010@gmail.com</strong> with screenshot.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !typedTitle.trim() || isCompressing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-950/50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending & Syncing...' : 'Add Feature & Dispatch Mail'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Features Catalog Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Features & Feedback Catalog</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredFeatures.length}
            </span>
          </h2>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features or author..."
              className="w-full px-3 py-1.5 bg-[#0D131A] border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredFeatures.map((feature) => {
            const commentsCount = feature.comments?.length || 0;
            const isCommentsOpen = !!openComments[feature.id];
            const author = feature.createdBy || { name: 'Prince', role: 'Farmer', avatar: '👨‍🌾' };
            const commentAttachedImage = commentScreenshots[feature.id];

            return (
              <div
                key={feature.id}
                className="matte-card rounded-2xl p-5 flex flex-col justify-between space-y-3 border border-slate-800 shadow-md hover:border-slate-700/80 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-1">
                          <span>{author.avatar || '👨‍🌾'}</span>
                          <span>by {author.name} ({author.role})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{feature.createdAt}</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePin(feature.id)}
                        title={feature.pinnedToDashboard ? 'Unpin' : 'Pin to Dashboard'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          feature.pinnedToDashboard
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                        }`}
                      >
                        {feature.pinnedToDashboard ? <Pin className="w-3.5 h-3.5 fill-emerald-400" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Feature Explanation */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {feature.userPrompt || feature.summary}
                  </p>

                  {/* Attached Feature Screenshot (if any) */}
                  {feature.screenshot && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0A0E13] relative group">
                      <img
                        src={feature.screenshot}
                        alt={`Screenshot for ${feature.title}`}
                        className="w-full max-h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setZoomedImage(feature.screenshot!)}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] text-white flex items-center gap-1 font-mono pointer-events-none">
                        <Maximize2 className="w-3 h-3" />
                        <span>Click to expand</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Comments Accordion Bar */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => toggleComments(feature.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isCommentsOpen
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-[#0D131A] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Comments & Screenshot Reports</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 text-[10px] font-mono ml-0.5">
                        {commentsCount}
                      </span>
                      {isCommentsOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>

                    {feature.screenshot && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Has Screenshot</span>
                      </span>
                    )}
                  </div>

                  {/* Collapsible Comment Thread */}
                  {isCommentsOpen && (
                    <div className="p-3.5 rounded-xl bg-[#090D12] border border-slate-800 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                        <span className="font-semibold text-slate-300">Feature Discussion & Screenshot Reports</span>
                        <span className="text-[10px] text-slate-500 font-mono">Shared between Prince & Friend</span>
                      </div>

                      {/* Comment list */}
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {commentsCount === 0 ? (
                          <p className="text-[11px] text-slate-500 italic py-1">
                            No comments yet. Anyone can leave feedback or upload a screenshot below explaining what's wrong!
                          </p>
                        ) : (
                          feature.comments?.map((cmt) => (
                            <div
                              key={cmt.id}
                              className="p-2.5 rounded-lg bg-[#0F161E] border border-slate-800/80 space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-white flex items-center gap-1">
                                  <span>{cmt.authorAvatar || '👤'}</span>
                                  <span>{cmt.authorName}</span>
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                                    {cmt.authorRole}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{cmt.createdAt}</span>
                              </div>

                              <p className="text-slate-300 text-xs leading-relaxed pl-4">
                                {cmt.text}
                              </p>

                              {/* Comment Screenshot Attachment (if any) */}
                              {cmt.screenshot && (
                                <div className="pl-4 pt-1">
                                  <div
                                    onClick={() => setZoomedImage(cmt.screenshot!)}
                                    className="relative max-w-[200px] rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer group"
                                  >
                                    <img
                                      src={cmt.screenshot}
                                      alt="Comment attachment"
                                      className="w-full max-h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment form with screenshot upload */}
                      <form
                        onSubmit={(e) => handleAddComment(feature.id, feature.title, e)}
                        className="space-y-2 pt-1 border-t border-slate-800/80"
                      >
                        {/* Comment Screenshot Preview (if selected) */}
                        {commentAttachedImage && (
                          <div className="p-2 rounded-lg bg-[#0F161E] border border-slate-700 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={commentAttachedImage}
                                alt="Comment preview"
                                className="w-10 h-10 object-cover rounded border border-slate-600"
                              />
                              <span className="text-[11px] text-slate-300">Screenshot attached to comment</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCommentScreenshots((prev) => ({ ...prev, [feature.id]: null }))}
                              className="text-slate-400 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentInputs[feature.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [feature.id]: e.target.value }))
                            }
                            placeholder={`Explain what's wrong or suggest improvement as ${user.name}...`}
                            className="flex-1 px-3 py-1.5 bg-[#0D131A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />

                          {/* Screenshot upload button for comment */}
                          <label
                            title="Attach screenshot to comment"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors shrink-0"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCommentScreenshotChange(feature.id, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={
                              isSendingComment[feature.id] ||
                              (!(commentInputs[feature.id] || '').trim() && !commentAttachedImage)
                            }
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Send className="w-3 h-3" />
                            <span>Post</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-slate-800/90 flex items-center justify-between border-b border-slate-700 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Feature Screenshot Preview</span>
              </span>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[calc(90vh-60px)] flex items-center justify-center bg-black/60">
              <img
                src={zoomedImage}
                alt="Enlarged screenshot view"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

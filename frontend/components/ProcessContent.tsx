'use client';

import { useState } from 'react';
import { Youtube, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProcessContentProps {
  onContentProcessed: (contentId: string) => void;
}

export default function ProcessContent({ onContentProcessed }: ProcessContentProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/process-video`, {
        url: youtubeUrl,
      });
      setSuccess('Video processed successfully!');
      onContentProcessed(response.data.content_id);
      setYoutubeUrl('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process video');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('PDF processed successfully!');
      onContentProcessed(response.data.content_id);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* YouTube Section */}
      <div className="group">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <Youtube className="w-5 h-5 text-pink-400 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 blur-md bg-pink-500/30 rounded-full"></div>
          </div>
          <h2 className="text-xl font-bold gradient-text">Process YouTube Video</h2>
        </div>
        <form onSubmit={handleYoutubeSubmit} className="space-y-3">
          <input
            type="url"
            placeholder="Enter YouTube URL..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Video'
            )}
          </button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/20"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-900 px-3 text-purple-400 text-xs font-semibold">OR</span>
        </div>
      </div>

      {/* PDF Section */}
      <div className="group">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <FileText className="w-5 h-5 text-purple-400 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 blur-md bg-purple-500/30 rounded-full"></div>
          </div>
          <h2 className="text-xl font-bold gradient-text">Upload PDF</h2>
        </div>
        <form onSubmit={handlePdfSubmit} className="space-y-3">
          <div className="relative border-2 border-dashed border-purple-500/40 rounded-xl p-8 text-center hover:border-pink-500/60 transition-all duration-300 bg-gray-900/40 backdrop-blur-sm group/upload cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="relative inline-block mb-3">
                <FileText className="w-10 h-10 mx-auto text-purple-400 group-hover/upload:text-pink-400 transition-colors" />
                <div className="absolute inset-0 blur-lg bg-purple-500/20 group-hover/upload:bg-pink-500/30 transition-all"></div>
              </div>
              <p className="text-purple-300 font-semibold text-sm group-hover/upload:text-pink-300 transition-colors">
                {file ? file.name : 'Click to upload PDF'}
              </p>
              <p className="text-purple-400/60 text-xs mt-1">Drag and drop or click to browse</p>
            </label>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !file}>
            {loading ? (
              <>
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Process PDF'
            )}
          </button>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-xl animate-pulse">
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-xl pulse-glow">
          <p className="font-medium text-sm">{success}</p>
        </div>
      )}
    </div>
  );
}

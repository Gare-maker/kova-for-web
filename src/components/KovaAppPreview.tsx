"use client";

import React, { useState } from "react";
import { Play, X } from "lucide-react";
import {
  KOVA_APP_PREVIEW_VIDEO,
  KOVA_APP_PREVIEW_POSTER,
} from "@/lib/format";

interface KovaAppPreviewProps {
  compact?: boolean;
  videoUrl?: string;
  posterUrl?: string;
}

export function KovaAppPreview({
  compact = false,
  videoUrl = KOVA_APP_PREVIEW_VIDEO,
  posterUrl = KOVA_APP_PREVIEW_POSTER,
}: KovaAppPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={`kova-preview-frame ${
        compact ? "kova-preview-frame--compact" : ""
      }`}
    >
      {!isPlaying ? (
        <button
          type="button"
          className="kova-preview-trigger"
          onClick={() => setIsPlaying(true)}
          aria-label="Play Kova app preview video"
        >
          <img
            src={posterUrl}
            alt="Kova mobile application preview"
            className="kova-preview-poster"
            loading="lazy"
            decoding="async"
          />
          <div className="kova-preview-scrim" aria-hidden="true" />

          <div className="kova-preview-topbar" aria-hidden="true">
            <span className="kova-preview-brand">
              <img
                src="/brand/kova-logo-main.svg"
                alt=""
                width={52}
                height={13}
              />
              <span>Mobile App</span>
            </span>
            <span className="kova-preview-duration">0:06</span>
          </div>

          <div className="kova-preview-center" aria-hidden="true">
            <span className="kova-preview-play">
              <Play size={compact ? 18 : 22} fill="#ffffff" color="#ffffff" />
            </span>
            <span className="kova-preview-cta">Play Kova App Preview</span>
          </div>
        </button>
      ) : (
        <div className="kova-preview-player">
          <video
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="kova-preview-video"
            aria-label="Kova mobile app video preview"
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            className="kova-preview-stop"
            onClick={() => setIsPlaying(false)}
            aria-label="Stop preview video"
          >
            <X size={13} />
            <span>Stop</span>
          </button>
        </div>
      )}
    </div>
  );
}


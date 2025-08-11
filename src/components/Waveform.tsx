import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2 } from "lucide-react";

interface WaveformProps {
  audioUrl?: string;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) {
      return;
    }

    const initializeWaveform = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }

        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current as HTMLElement,
          waveColor: "hsl(var(--muted-foreground))",
          progressColor: "hsl(var(--primary))",
          cursorColor: "hsl(var(--primary))",
          barWidth: 2,
          barGap: 1,
          height: 80,
          normalize: true,
        });

        wavesurferRef.current = wavesurfer;

        wavesurfer.on("ready", () => {
          setIsLoading(false);
        });

        wavesurfer.on("error", (err) => {
          setError(t("waveformError", "Failed to load waveform"));
          setIsLoading(false);
          console.error("Waveform error:", err);
        });

        await wavesurfer.load(audioUrl);
      } catch (err) {
        setError(t("waveformError", "Failed to load waveform"));
        setIsLoading(false);
        console.error("Waveform initialization error:", err);
      }
    };

    initializeWaveform();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, t]);

  if (!audioUrl) {
    return null;
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {t("waveform", "Waveform")}
      </h3>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        <div
          ref={waveformRef}
          className="w-full border rounded bg-background/50"
          style={{ minHeight: 80 }}
        />
      </div>
    </div>
  );
};

export default Waveform;
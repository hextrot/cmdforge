"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import CommandPreview from "@/components/CommandPreview";
import Section from "@/components/Section";
import FormField, { TextInput, SelectInput, CheckboxInput, NumberInput } from "@/components/FormField";
import AiHelper from "@/components/AiHelper";

export default function FfmpegBuilder() {
  const [mode, setMode] = useState("convert");

  // Input/Output
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [overwrite, setOverwrite] = useState(false);

  // Video
  const [videoCodec, setVideoCodec] = useState("");
  const [videoBitrate, setVideoBitrate] = useState("");
  const [resolution, setResolution] = useState("");
  const [fps, setFps] = useState("");
  const [aspect, setAspect] = useState("");
  const [crf, setCrf] = useState("");
  const [preset, setPreset] = useState("");
  const [pixFmt, setPixFmt] = useState("");
  const [noVideo, setNoVideo] = useState(false);

  // Audio
  const [audioCodec, setAudioCodec] = useState("");
  const [audioBitrate, setAudioBitrate] = useState("");
  const [sampleRate, setSampleRate] = useState("");
  const [channels, setChannels] = useState("");
  const [volume, setVolume] = useState("");
  const [noAudio, setNoAudio] = useState(false);

  // Trim
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [endTime, setEndTime] = useState("");

  // Filters
  const [scale, setScale] = useState("");
  const [crop, setCrop] = useState("");
  const [rotate, setRotate] = useState("");
  const [speed, setSpeed] = useState("");
  const [deinterlace, setDeinterlace] = useState(false);
  const [denoise, setDenoise] = useState(false);
  const [customFilter, setCustomFilter] = useState("");

  // GIF-specific
  const [gifFps, setGifFps] = useState("10");
  const [gifWidth, setGifWidth] = useState("480");

  // Concat
  const [concatInputs, setConcatInputs] = useState("");

  // Extract audio
  const [extractFormat, setExtractFormat] = useState("mp3");

  // Thumbnail
  const [thumbTime, setThumbTime] = useState("00:00:01");

  // Advanced
  const [threads, setThreads] = useState("");
  const [loglevel, setLoglevel] = useState("");
  const [metadata, setMetadata] = useState("");
  const [mapStream, setMapStream] = useState("");
  const [hwaccel, setHwaccel] = useState("");
  const [customArgs, setCustomArgs] = useState("");

  const command = useMemo(() => {
    const parts: string[] = ["ffmpeg"];

    if (overwrite) parts.push("-y");
    if (hwaccel) parts.push(`-hwaccel ${hwaccel}`);
    if (loglevel) parts.push(`-loglevel ${loglevel}`);
    if (threads) parts.push(`-threads ${threads}`);

    if (mode === "convert" || mode === "trim") {
      if (input) parts.push(`-i '${input}'`);
      if (startTime) parts.push(`-ss ${startTime}`);
      if (duration) parts.push(`-t ${duration}`);
      if (endTime) parts.push(`-to ${endTime}`);

      if (noVideo) {
        parts.push("-vn");
      } else {
        if (videoCodec) parts.push(`-c:v ${videoCodec}`);
        if (videoBitrate) parts.push(`-b:v ${videoBitrate}`);
        if (resolution) parts.push(`-s ${resolution}`);
        if (fps) parts.push(`-r ${fps}`);
        if (aspect) parts.push(`-aspect ${aspect}`);
        if (crf) parts.push(`-crf ${crf}`);
        if (preset) parts.push(`-preset ${preset}`);
        if (pixFmt) parts.push(`-pix_fmt ${pixFmt}`);
      }

      if (noAudio) {
        parts.push("-an");
      } else {
        if (audioCodec) parts.push(`-c:a ${audioCodec}`);
        if (audioBitrate) parts.push(`-b:a ${audioBitrate}`);
        if (sampleRate) parts.push(`-ar ${sampleRate}`);
        if (channels) parts.push(`-ac ${channels}`);
      }

      // Video filters
      const vf: string[] = [];
      if (scale) vf.push(`scale=${scale}`);
      if (crop) vf.push(`crop=${crop}`);
      if (rotate) vf.push(`rotate=${rotate}`);
      if (speed) vf.push(`setpts=${1 / parseFloat(speed || "1")}*PTS`);
      if (deinterlace) vf.push("yadif");
      if (denoise) vf.push("hqdn3d");
      if (customFilter) vf.push(customFilter);
      if (vf.length) parts.push(`-vf '${vf.join(",")}'`);

      // Audio filters
      const af: string[] = [];
      if (volume) af.push(`volume=${volume}`);
      if (speed) af.push(`atempo=${speed}`);
      if (af.length) parts.push(`-af '${af.join(",")}'`);

      if (mapStream) parts.push(`-map ${mapStream}`);
      if (metadata) parts.push(`-metadata ${metadata}`);
      if (customArgs) parts.push(customArgs);
      if (output) parts.push(`'${output}'`);
    } else if (mode === "gif") {
      if (input) parts.push(`-i '${input}'`);
      if (startTime) parts.push(`-ss ${startTime}`);
      if (duration) parts.push(`-t ${duration}`);
      parts.push(`-vf 'fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'`);
      if (output) parts.push(`'${output}'`);
    } else if (mode === "extract-audio") {
      if (input) parts.push(`-i '${input}'`);
      parts.push("-vn");
      if (extractFormat === "mp3") {
        parts.push("-c:a libmp3lame");
        if (audioBitrate) parts.push(`-b:a ${audioBitrate}`);
      } else if (extractFormat === "aac") {
        parts.push("-c:a aac");
        if (audioBitrate) parts.push(`-b:a ${audioBitrate}`);
      } else if (extractFormat === "wav") {
        parts.push("-c:a pcm_s16le");
      } else if (extractFormat === "flac") {
        parts.push("-c:a flac");
      }
      if (output) parts.push(`'${output}'`);
    } else if (mode === "thumbnail") {
      if (input) parts.push(`-i '${input}'`);
      parts.push(`-ss ${thumbTime}`);
      parts.push("-vframes 1");
      if (resolution) parts.push(`-s ${resolution}`);
      if (output) parts.push(`'${output}'`);
    } else if (mode === "concat") {
      if (concatInputs) {
        parts.push(`-f concat -safe 0 -i '${concatInputs}'`);
      }
      parts.push("-c copy");
      if (output) parts.push(`'${output}'`);
    }

    return parts.join(" \\\n  ");
  }, [mode, input, output, overwrite, videoCodec, videoBitrate, resolution, fps, aspect, crf, preset, pixFmt, noVideo, audioCodec, audioBitrate, sampleRate, channels, volume, noAudio, startTime, duration, endTime, scale, crop, rotate, speed, deinterlace, denoise, customFilter, gifFps, gifWidth, concatInputs, extractFormat, thumbTime, threads, loglevel, metadata, mapStream, hwaccel, customArgs]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-lg">
            ▶
          </div>
          <div>
            <h1 className="text-xl font-bold">ffmpeg Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Build media processing commands visually</p>
          </div>
        </div>

        <AiHelper tool="ffmpeg" onCommandGenerated={(cmd) => { setInput(cmd); }} />

        {/* Mode Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)] overflow-x-auto">
          {[
            { id: "convert", label: "Convert" },
            { id: "trim", label: "Trim" },
            { id: "gif", label: "GIF" },
            { id: "extract-audio", label: "Extract Audio" },
            { id: "thumbnail", label: "Thumbnail" },
            { id: "concat", label: "Concatenate" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                mode === m.id
                  ? "text-[var(--color-accent)] tab-active"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Input/Output — always shown */}
        <Section title="Input / Output">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Input File" required>
              <TextInput value={input} onChange={setInput} placeholder="input.mp4" />
            </FormField>
            <FormField label="Output File" required>
              <TextInput value={output} onChange={setOutput} placeholder={mode === "gif" ? "output.gif" : mode === "thumbnail" ? "thumb.jpg" : "output.mp4"} />
            </FormField>
          </div>
          <CheckboxInput checked={overwrite} onChange={setOverwrite} label="Overwrite output (-y)" />
        </Section>

        {(mode === "convert" || mode === "trim") && (
          <>
            {mode === "trim" && (
              <Section title="Trim">
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Start Time (-ss)" hint="HH:MM:SS or seconds">
                    <TextInput value={startTime} onChange={setStartTime} placeholder="00:01:30" />
                  </FormField>
                  <FormField label="Duration (-t)">
                    <TextInput value={duration} onChange={setDuration} placeholder="00:00:30" />
                  </FormField>
                  <FormField label="End Time (-to)">
                    <TextInput value={endTime} onChange={setEndTime} placeholder="00:02:00" />
                  </FormField>
                </div>
              </Section>
            )}

            <Section title="Video" defaultOpen={mode === "convert"}>
              <CheckboxInput checked={noVideo} onChange={setNoVideo} label="Disable video (-vn)" />
              {!noVideo && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Codec (-c:v)">
                    <SelectInput value={videoCodec} onChange={setVideoCodec} options={[
                      { value: "", label: "Auto" },
                      { value: "libx264", label: "H.264 (libx264)" },
                      { value: "libx265", label: "H.265 (libx265)" },
                      { value: "libvpx-vp9", label: "VP9" },
                      { value: "libaom-av1", label: "AV1" },
                      { value: "copy", label: "Copy (no re-encode)" },
                      { value: "mpeg4", label: "MPEG-4" },
                      { value: "prores_ks", label: "ProRes" },
                    ]} />
                  </FormField>
                  <FormField label="Bitrate (-b:v)">
                    <TextInput value={videoBitrate} onChange={setVideoBitrate} placeholder="5M, 2000k..." />
                  </FormField>
                  <FormField label="Resolution (-s)">
                    <SelectInput value={resolution} onChange={setResolution} options={[
                      { value: "", label: "Original" },
                      { value: "3840x2160", label: "4K (3840x2160)" },
                      { value: "1920x1080", label: "1080p" },
                      { value: "1280x720", label: "720p" },
                      { value: "854x480", label: "480p" },
                      { value: "640x360", label: "360p" },
                    ]} />
                  </FormField>
                  <FormField label="Frame Rate (-r)">
                    <SelectInput value={fps} onChange={setFps} options={[
                      { value: "", label: "Original" },
                      { value: "60", label: "60 fps" },
                      { value: "30", label: "30 fps" },
                      { value: "24", label: "24 fps" },
                      { value: "15", label: "15 fps" },
                    ]} />
                  </FormField>
                  <FormField label="CRF (Quality)" hint="Lower = better. 18-28 typical">
                    <NumberInput value={crf} onChange={setCrf} placeholder="23" min={0} max={51} />
                  </FormField>
                  <FormField label="Preset">
                    <SelectInput value={preset} onChange={setPreset} options={[
                      { value: "", label: "Default" },
                      { value: "ultrafast", label: "Ultrafast" },
                      { value: "superfast", label: "Superfast" },
                      { value: "veryfast", label: "Very Fast" },
                      { value: "faster", label: "Faster" },
                      { value: "fast", label: "Fast" },
                      { value: "medium", label: "Medium" },
                      { value: "slow", label: "Slow" },
                      { value: "slower", label: "Slower" },
                      { value: "veryslow", label: "Very Slow" },
                    ]} />
                  </FormField>
                  <FormField label="Aspect Ratio">
                    <SelectInput value={aspect} onChange={setAspect} options={[
                      { value: "", label: "Auto" },
                      { value: "16:9", label: "16:9" },
                      { value: "4:3", label: "4:3" },
                      { value: "1:1", label: "1:1" },
                      { value: "21:9", label: "21:9" },
                    ]} />
                  </FormField>
                  <FormField label="Pixel Format">
                    <SelectInput value={pixFmt} onChange={setPixFmt} options={[
                      { value: "", label: "Auto" },
                      { value: "yuv420p", label: "yuv420p (most compatible)" },
                      { value: "yuv444p", label: "yuv444p" },
                      { value: "rgb24", label: "rgb24" },
                    ]} />
                  </FormField>
                </div>
              )}
            </Section>

            <Section title="Audio" defaultOpen={false}>
              <CheckboxInput checked={noAudio} onChange={setNoAudio} label="Disable audio (-an)" />
              {!noAudio && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Codec (-c:a)">
                    <SelectInput value={audioCodec} onChange={setAudioCodec} options={[
                      { value: "", label: "Auto" },
                      { value: "aac", label: "AAC" },
                      { value: "libmp3lame", label: "MP3" },
                      { value: "libvorbis", label: "Vorbis" },
                      { value: "libopus", label: "Opus" },
                      { value: "flac", label: "FLAC" },
                      { value: "pcm_s16le", label: "PCM (WAV)" },
                      { value: "copy", label: "Copy" },
                    ]} />
                  </FormField>
                  <FormField label="Bitrate (-b:a)">
                    <TextInput value={audioBitrate} onChange={setAudioBitrate} placeholder="128k, 320k..." />
                  </FormField>
                  <FormField label="Sample Rate (-ar)">
                    <SelectInput value={sampleRate} onChange={setSampleRate} options={[
                      { value: "", label: "Original" },
                      { value: "48000", label: "48000 Hz" },
                      { value: "44100", label: "44100 Hz" },
                      { value: "22050", label: "22050 Hz" },
                    ]} />
                  </FormField>
                  <FormField label="Channels (-ac)">
                    <SelectInput value={channels} onChange={setChannels} options={[
                      { value: "", label: "Original" },
                      { value: "1", label: "Mono" },
                      { value: "2", label: "Stereo" },
                      { value: "6", label: "5.1 Surround" },
                    ]} />
                  </FormField>
                  <FormField label="Volume">
                    <TextInput value={volume} onChange={setVolume} placeholder="1.5, 0.5, 2dB..." />
                  </FormField>
                </div>
              )}
            </Section>

            <Section title="Filters" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Scale" hint="width:height or w:-1">
                  <TextInput value={scale} onChange={setScale} placeholder="1280:-1" />
                </FormField>
                <FormField label="Crop" hint="w:h:x:y">
                  <TextInput value={crop} onChange={setCrop} placeholder="640:480:0:0" />
                </FormField>
                <FormField label="Rotate" hint="Radians or PI/2">
                  <TextInput value={rotate} onChange={setRotate} placeholder="PI/2" />
                </FormField>
                <FormField label="Speed" hint="0.5 = half, 2 = double">
                  <TextInput value={speed} onChange={setSpeed} placeholder="1.0" />
                </FormField>
              </div>
              <div className="flex gap-4">
                <CheckboxInput checked={deinterlace} onChange={setDeinterlace} label="Deinterlace (yadif)" />
                <CheckboxInput checked={denoise} onChange={setDenoise} label="Denoise (hqdn3d)" />
              </div>
              <FormField label="Custom Filter" hint="Raw -vf filter string">
                <TextInput value={customFilter} onChange={setCustomFilter} placeholder="eq=brightness=0.06:saturation=1.5" />
              </FormField>
            </Section>
          </>
        )}

        {mode === "gif" && (
          <Section title="GIF Settings">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Time">
                <TextInput value={startTime} onChange={setStartTime} placeholder="00:00:05" />
              </FormField>
              <FormField label="Duration">
                <TextInput value={duration} onChange={setDuration} placeholder="3" />
              </FormField>
              <FormField label="FPS">
                <NumberInput value={gifFps} onChange={setGifFps} placeholder="10" min={1} max={30} />
              </FormField>
              <FormField label="Width" hint="-1 for auto height">
                <NumberInput value={gifWidth} onChange={setGifWidth} placeholder="480" min={1} />
              </FormField>
            </div>
          </Section>
        )}

        {mode === "extract-audio" && (
          <Section title="Audio Extraction">
            <FormField label="Output Format">
              <SelectInput value={extractFormat} onChange={setExtractFormat} options={[
                { value: "mp3", label: "MP3" },
                { value: "aac", label: "AAC" },
                { value: "wav", label: "WAV" },
                { value: "flac", label: "FLAC" },
              ]} />
            </FormField>
            <FormField label="Bitrate">
              <TextInput value={audioBitrate} onChange={setAudioBitrate} placeholder="192k" />
            </FormField>
          </Section>
        )}

        {mode === "thumbnail" && (
          <Section title="Thumbnail">
            <FormField label="Timestamp" hint="Time to capture the frame">
              <TextInput value={thumbTime} onChange={setThumbTime} placeholder="00:00:01" />
            </FormField>
            <FormField label="Resolution" hint="Leave empty for original size">
              <SelectInput value={resolution} onChange={setResolution} options={[
                { value: "", label: "Original" },
                { value: "1920x1080", label: "1080p" },
                { value: "1280x720", label: "720p" },
                { value: "640x360", label: "360p" },
              ]} />
            </FormField>
          </Section>
        )}

        {mode === "concat" && (
          <Section title="Concatenation">
            <FormField label="File List" required hint="Path to a text file with lines like: file 'video1.mp4'">
              <TextInput value={concatInputs} onChange={setConcatInputs} placeholder="filelist.txt" />
            </FormField>
          </Section>
        )}

        <Section title="Advanced" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Threads">
              <NumberInput value={threads} onChange={setThreads} placeholder="Auto" min={0} />
            </FormField>
            <FormField label="Log Level">
              <SelectInput value={loglevel} onChange={setLoglevel} options={[
                { value: "", label: "Default" },
                { value: "quiet", label: "Quiet" },
                { value: "error", label: "Error" },
                { value: "warning", label: "Warning" },
                { value: "info", label: "Info" },
                { value: "verbose", label: "Verbose" },
                { value: "debug", label: "Debug" },
              ]} />
            </FormField>
            <FormField label="HW Acceleration">
              <SelectInput value={hwaccel} onChange={setHwaccel} options={[
                { value: "", label: "None" },
                { value: "auto", label: "Auto" },
                { value: "cuda", label: "CUDA (NVIDIA)" },
                { value: "videotoolbox", label: "VideoToolbox (macOS)" },
                { value: "qsv", label: "Quick Sync (Intel)" },
                { value: "vaapi", label: "VAAPI (Linux)" },
              ]} />
            </FormField>
            <FormField label="Map Stream">
              <TextInput value={mapStream} onChange={setMapStream} placeholder="0:v:0" />
            </FormField>
          </div>
          <FormField label="Metadata">
            <TextInput value={metadata} onChange={setMetadata} placeholder="title='My Video'" />
          </FormField>
          <FormField label="Custom Arguments" hint="Appended raw to the command">
            <TextInput value={customArgs} onChange={setCustomArgs} placeholder="-movflags +faststart" />
          </FormField>
        </Section>

        <div className="h-4" />
      </main>
      <CommandPreview command={command} />
    </div>
  );
}

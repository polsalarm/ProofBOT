"use client";

import { useCallback, useRef, useState } from "react";
import type { Hash } from "viem";

import { hashFile, hashText } from "@/lib/hashing";

export type ContentMode = "text" | "file";
type HashStatus = "idle" | "hashing" | "ready" | "error";

export function useContentHash(initialMode: ContentMode = "text") {
  const [mode, setModeState] = useState<ContentMode>(initialMode);
  const [text, setTextState] = useState("");
  const [file, setFile] = useState<File>();
  const [hash, setHash] = useState<Hash>();
  const [status, setStatus] = useState<HashStatus>("idle");
  const [error, setError] = useState<string>();
  const fileRequest = useRef(0);

  const clearResult = useCallback(() => {
    setHash(undefined);
    setError(undefined);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    fileRequest.current += 1;
    setModeState(initialMode);
    setTextState("");
    setFile(undefined);
    clearResult();
  }, [clearResult, initialMode]);

  const setMode = useCallback(
    (nextMode: ContentMode) => {
      fileRequest.current += 1;
      setModeState(nextMode);
      setTextState("");
      setFile(undefined);
      clearResult();
    },
    [clearResult],
  );

  const setText = useCallback((value: string) => {
    fileRequest.current += 1;
    setTextState(value);
    setFile(undefined);
    setError(undefined);
    if (value.length === 0) {
      setHash(undefined);
      setStatus("idle");
      return;
    }

    setStatus("hashing");
    try {
      setHash(hashText(value));
      setStatus("ready");
    } catch (cause) {
      setHash(undefined);
      setError(cause instanceof Error ? cause.message : "The text could not be hashed.");
      setStatus("error");
    }
  }, []);

  const setSelectedFile = useCallback(async (nextFile?: File) => {
    const requestId = ++fileRequest.current;
    setFile(nextFile);
    setTextState("");
    setHash(undefined);
    setError(undefined);
    if (!nextFile) {
      setStatus("idle");
      return;
    }

    setStatus("hashing");
    try {
      const nextHash = await hashFile(nextFile);
      if (requestId !== fileRequest.current) return;
      setHash(nextHash);
      setStatus("ready");
    } catch (cause) {
      if (requestId !== fileRequest.current) return;
      setError(cause instanceof Error ? cause.message : "The file could not be hashed.");
      setStatus("error");
    }
  }, []);

  return {
    mode,
    setMode,
    text,
    setText,
    file,
    setSelectedFile,
    hash,
    status,
    error,
    reset,
  } as const;
}

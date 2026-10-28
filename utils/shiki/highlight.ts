import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import go from "@shikijs/langs/go";
import html from "@shikijs/langs/html";
import js from "@shikijs/langs/js";
import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/mdx";
import python from "@shikijs/langs/python";
import sql from "@shikijs/langs/sql";
import ts from "@shikijs/langs/ts";
import tsx from "@shikijs/langs/tsx";
import darkTheme from "@shikijs/themes/one-dark-pro";
import lightTheme from "@shikijs/themes/one-light";
import {
  createHighlighterCore,
  type HighlighterCore,
  type RegexEngine,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let jsEngine: RegexEngine | null = null;
let highlighter: Promise<HighlighterCore> | null = null;

// Settings for UI components
const Themes = {
  light: "one-light",
  dark: "one-dark-pro",
};

type Languages =
  | "html"
  | "js"
  | "ts"
  | "tsx"
  | "css"
  | "bash"
  | "json"
  | "mdx"
  | "sql"
  | "python";

const getJsEngine = (): RegexEngine => {
  jsEngine ??= createJavaScriptRegexEngine();
  return jsEngine;
};

const highlight = async (): Promise<HighlighterCore> => {
  highlighter ??= createHighlighterCore({
    themes: [lightTheme, darkTheme],
    langs: [bash, js, ts, tsx, css, markdown, html, json, go, sql, python],
    engine: getJsEngine(),
  });
  return highlighter;
};

export { highlight, Themes, type Languages };

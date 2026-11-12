const PAPER = "#F3F4F6";
const INK = "#18181B";
const QUIET = "#71717A";
const RULE = "#D4D4D8";
const MARK = "#FF9800";

const MARGIN = 132;
const GUTTER = 36;
const TEXT_WIDTH = 968;
const LINE_HEIGHT = 1.32;

function clip(text: string, max: number) {
  const chars = [...text];
  if (chars.length <= max) return text;
  const sliced = chars.slice(0, max - 1).join("");
  const breakAt = Math.max(
    sliced.lastIndexOf("，"),
    sliced.lastIndexOf("。"),
    sliced.lastIndexOf("、"),
    sliced.lastIndexOf(" "),
  );
  if (breakAt >= Math.floor(max * 0.55)) {
    return `${sliced.slice(0, breakAt)}…`;
  }
  return `${sliced}…`;
}

function titleSize(title: string) {
  const length = [...title].length;
  if (length <= 12) return 68;
  if (length <= 24) return 56;
  if (length <= 40) return 48;
  return 42;
}

export function BlogOgCard({
  title,
  description,
  category,
  date,
  detail,
}: {
  title: string;
  description?: string;
  category?: string;
  date?: string;
  detail?: string;
}) {
  const size = titleSize(title);
  const summary = description ? clip(description, 72) : "";
  const markOffset = Math.round((size * LINE_HEIGHT - 14) / 2);
  const meta = {
    display: "flex" as const,
    fontFamily: "Geist Mono",
    fontSize: 22,
    color: QUIET,
  };

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        backgroundColor: PAPER,
        color: INK,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 48,
          width: 2,
          height: 534,
          backgroundColor: RULE,
        }}
      />
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          padding: "52px 64px 48px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            width: TEXT_WIDTH,
            marginLeft: MARGIN + GUTTER,
            justifyContent: "space-between",
          }}
        >
          <div style={meta}>zx&apos;s Garden</div>
          {category ? <div style={meta}>{category}</div> : <div style={meta} />}
        </div>

        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                width: MARGIN,
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: 22,
                paddingTop: markOffset,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 14,
                  backgroundColor: MARK,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: TEXT_WIDTH,
                marginLeft: GUTTER,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: TEXT_WIDTH,
                  fontFamily: "Geist",
                  fontSize: size,
                  fontWeight: 600,
                  lineHeight: LINE_HEIGHT,
                  letterSpacing: -0.4,
                }}
              >
                {title}
              </div>
              {summary ? (
                <div
                  style={{
                    display: "flex",
                    width: TEXT_WIDTH,
                    marginTop: 28,
                    fontFamily: "Geist Mono",
                    fontSize: 24,
                    lineHeight: 1.5,
                    color: QUIET,
                  }}
                >
                  {summary}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: TEXT_WIDTH,
            marginLeft: MARGIN + GUTTER,
            justifyContent: "space-between",
          }}
        >
          <div style={meta}>{date ?? detail ?? ""}</div>
          <div style={meta}>{date ? (detail ?? "") : ""}</div>
        </div>
      </div>
    </div>
  );
}

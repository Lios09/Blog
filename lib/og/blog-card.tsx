const INK = "#f4f4f5";
const MUTED = "#a1a1aa";
const ACCENT = "#3B82F6";
const WASH = "#87CEFA";

function clip(text: string, max: number) {
  const chars = [...text];
  if (chars.length <= max) return text;
  return `${chars.slice(0, max - 1).join("")}…`;
}

function titleSize(title: string) {
  const length = [...title].length;
  if (length <= 16) return 72;
  if (length <= 32) return 56;
  return 44;
}

export function BlogOgCard({
  kicker,
  title,
  description,
  meta,
  tags = [],
}: {
  kicker: string;
  title: string;
  description?: string;
  meta?: string;
  tags?: string[];
}) {
  const shownTags = tags.slice(0, 3);
  const summary = description ? clip(description, 88) : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#050505",
        color: INK,
      }}
    >
      <div
        style={{
          width: 10,
          height: "100%",
          backgroundColor: ACCENT,
        }}
      />
      <div
        style={{
          width: 1190,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: 22,
              letterSpacing: 1.5,
              color: MUTED,
            }}
          >
            zx&apos;s Garden
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: 22,
              letterSpacing: 2,
              color: WASH,
            }}
          >
            {kicker}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 1040,
              fontFamily: "Geist",
              fontSize: titleSize(title),
              fontWeight: 600,
              lineHeight: 1.18,
              letterSpacing: -0.8,
            }}
          >
            {title}
          </div>
          {summary ? (
            <div
              style={{
                display: "flex",
                width: 1040,
                marginTop: 28,
                fontFamily: "Geist Mono",
                fontSize: 26,
                lineHeight: 1.45,
                color: MUTED,
              }}
            >
              {summary}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: 22,
              color: MUTED,
            }}
          >
            {meta ?? ""}
          </div>
          <div style={{ display: "flex" }}>
            {shownTags.map((tag, index) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  marginLeft: index === 0 ? 0 : 18,
                  fontFamily: "Geist Mono",
                  fontSize: 22,
                  color: WASH,
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

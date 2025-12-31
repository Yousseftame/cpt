import  { useState, useEffect } from 'react';
import {  ArrowRight } from 'lucide-react';

interface EnhancedDashboardHeaderProps {}

export default function EnhancedDashboardHeader({}: EnhancedDashboardHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "28px",
      }}
    >
      {/* Left Card - Dark Elegant Style */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.2)";
        }}
      >
        {/* Gradient Background Animation */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(46, 229, 157, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#2EE59D",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                color: "#2EE59D",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              WELCOME BACK
            </span>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              marginBottom: "4px",
              lineHeight: 1.2,
            }}
          >
            Welcome back 
          </h1>

          <h2
            style={{
              fontSize: "26px",
              fontWeight: "900",
              background: "linear-gradient(120deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent" as any,
              marginBottom: "12px",
              marginTop: "2px",
            }}
          >
            Youssef
          </h2>

          <p
            style={{
              fontSize: "13px",
              opacity: 0.75,
              lineHeight: 1.5,
              marginBottom: "16px",
              maxWidth: "100%",
            }}
          >
            Ready to dive in? You have 12 new updates and 3 pending tasks.
          </p>

          <button
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid rgba(46, 229, 157, 0.5)",
              backgroundColor: "rgba(46, 229, 157, 0.1)",
              color: "#2EE59D",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(46, 229, 157, 0.2)";
              e.currentTarget.style.borderColor = "rgba(46, 229, 157, 0.8)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(46, 229, 157, 0.1)";
              e.currentTarget.style.borderColor = "rgba(46, 229, 157, 0.5)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Get Started
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Right Card - Featured App Style */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "200px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.2)";
        }}
      >
        {/* Decorative Element */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(46, 229, 157, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#2EE59D",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                color: "#2EE59D",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              FEATURED APP
            </span>
          </div>

          <h3
            style={{
              fontSize: "18px",
              fontWeight: "800",
              marginBottom: "8px",
              lineHeight: 1.3,
            }}
          >
            Mental Health in the Digital Age
          </h3>

          <p
            style={{
              fontSize: "13px",
              opacity: 0.7,
              lineHeight: 1.5,
              marginBottom: "16px",
            }}
          >
            Discover insights on maintaining wellness while navigating the digital landscape.
          </p>
        </div>

        <button
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(46, 229, 157, 0.5)",
            backgroundColor: "rgba(46, 229, 157, 0.1)",
            color: "#2EE59D",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            position: "relative",
            zIndex: 2,
            transition: "all 0.3s ease",
            width: "fit-content",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(46, 229, 157, 0.2)";
            e.currentTarget.style.borderColor = "rgba(46, 229, 157, 0.8)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(46, 229, 157, 0.1)";
            e.currentTarget.style.borderColor = "rgba(46, 229, 157, 0.5)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Read More
          <ArrowRight size={14} />
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(46, 229, 157, 0.7);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(46, 229, 157, 0);
          }
        }
      `}</style>
    </div>
  );
}
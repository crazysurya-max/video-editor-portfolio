import Reviews from "@/components/Reviews";
const WHATSAPP_NUMBER = "YOUR_NUMBER"; // digits only, with country code e.g. 919876543210
const wa = `https://wa.me/${WHATSAPP_NUMBER}`;
export default function Home() { return (<>
  <nav className="nav"><b>[YOUR NAME]</b><span><a href="#home">Home</a> <a href="#work">Work</a> <a href="#reviews">Reviews</a> <a href="#contact">Contact</a></span><a className="btn" href="#contact">Let&apos;s Work Together →</a></nav>
  <main>
  <section id="home" className="wrap hero"><div><p className="eyebrow">SHORT-FORM VIDEO EDITOR</p>
    <h1>I TURN RAW FOOTAGE INTO <span className="grad">CONTENT PEOPLE CAN&apos;T SCROLL PAST.</span></h1>
    <p className="muted">I edit short-form content with sharper pacing, cleaner storytelling and visuals designed to hold attention from the first second to the last.</p>
    <a className="btn" href="#contact">Start a Project →</a> <a className="btn ghost" href="#work">View My Work</a></div>
    {/* Replace with <img src="/images/profile.jpg" alt="[YOUR NAME]"> */}
    <div className="glass ph">[YOUR PROFILE PHOTO]</div></section>
  <section id="work" className="wrap"><p className="eyebrow">SELECTED WORK</p><h2>THE EDITING BEHIND THE ATTENTION.</h2>
    {/* Add videos at /public/videos/project-01.mp4 etc. */}
    <div className="glass ph">[PORTFOLIO VIDEOS]</div></section>
  <Reviews />
  <section id="contact" className="wrap"><h2>LET&apos;S CREATE SOMETHING PEOPLE CAN&apos;T IGNORE.</h2>
    <a className="btn" href={wa}>Chat on WhatsApp →</a></section></main>
  <a href={wa} className="wa" aria-label="Chat with me on WhatsApp" title="Chat with me on WhatsApp">💬</a>
  <footer className="wrap muted">© 2026 [YOUR NAME]. All rights reserved.</footer></>); }

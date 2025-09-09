import { Link } from 'react-router';

const About = () => {
  return (
    <>
      {/* Import Google Fonts (one for Arabic, one for English) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Mada:wght@200..900&family=Noto+Nastaliq+Urdu:wght@400..700&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6  "
        style={{ fontFamily: "'Amiri', serif" }} // Arabic font
      >
        {/* Arabic Quote */}
        <h1 className="text-3xl md:text-4xl text-center text-gray-300 mb-10 leading-relaxed">
          المؤمن كالغيث، أينما حل نفع
        </h1>

        {/* Social Links */}
        <div
          className="bg-gray-300 shadow-xl rounded-2xl p-8 w-full max-w-lg text-center"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-[#3F3F3F]">
            Follow Me
          </h2>
          <ul className="flex flex-wrap justify-center gap-6 text-lg">
            <li className="hover:text-blue-600 transition-colors duration-300 text-[#3F3F3F]">
              <Link
                to="https://www.linkedin.com/in/ahmad-ayed-67b74a272/"
                target="_blank"
              >
                LinkedIn
              </Link>
            </li>
            <li className="hover:text-pink-500 transition-colors duration-300 text-[#3F3F3F]">
              <Link to="https://www.instagram.com/aboayed22/" target="_blank">
                Instagram
              </Link>
            </li>
            <li className="hover:text-blue-700 transition-colors duration-300 text-[#3F3F3F]">
              <Link to="https://www.facebook.com/Aboayed22" target="_blank">
                Facebook
              </Link>
            </li>
            <li className="hover:text-red-500 transition-colors duration-300 text-[#3F3F3F]">
              <Link
                to="https://www.youtube.com/channel/UC0qVeAYvVWkL7smqknFzBBQ"
                target="_blank"
              >
                YouTube
              </Link>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p
          className="mt-10 text-gray-300 text-lg"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Developed By <span className="font-semibold">Ahmad Ayed</span>
        </p>
      </div>
    </>
  );
};

export default About;

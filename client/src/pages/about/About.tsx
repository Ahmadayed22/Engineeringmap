import { Link } from 'react-router';

const About = () => {
  return (
    <>
      {/* Import Google Font for this page only */}
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri&display=swap"
        rel="stylesheet"
      />

      <div style={{ fontFamily: "'Amiri', serif" }}>
        <h1 className="text-black text-4xl mb-4 mt-[5%] text-center">
          Devloped By aboayed
        </h1>
        <h1 className="text-black text-4xl mb-4 mt-[5%] text-center">
          المؤمن كالغيث، أينما حل نفع
        </h1>
        <h2 className="text-black text-4xl mb-4 mt-[5%] text-center">
          الدعوة هدية حلوة منك
        </h2>

        <div className="max-w-md mx-auto mt-[5%] text-black">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-6xl mb-4">Follow</h1>
            <ul className="flex flex-col gap-4">
              <li className="hover:text-red-600">
                <Link
                  to="https://www.linkedin.com/in/ahmad-ayed-67b74a272/"
                  target="_blank"
                >
                  LinkedIn
                </Link>
              </li>
              <li className="hover:text-red-600">
                <Link to="https://www.instagram.com/aboayed22/" target="_blank">
                  Instagram
                </Link>
              </li>
              <li className="hover:text-red-600">
                <Link to="https://www.facebook.com/Aboayed22" target="_blank">
                  Facebook
                </Link>
              </li>
              <li className="hover:text-red-600">
                <Link
                  to="https://www.youtube.com/channel/UC0qVeAYvVWkL7smqknFzBBQ"
                  target="_blank"
                >
                  Youtube
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <h2 className="text-black text-4xl mb-4 mt-[5%] md:mt-[3%] text-center">
          سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك
        </h2>
      </div>
    </>
  );
};

export default About;

import { Link } from 'react-router';

const About = () => {
  return (
    <div className="max-w-md mx-auto mt-[15%]">
      <div className=" flex flex-col justify-center items-center text-white">
        <h1 className="text-6xl mb-4">Follow</h1>
        <div>
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                to="https://www.linkedin.com/in/ahmad-ayed-67b74a272/"
                target="_blank"
              >
                LinkedIn
              </Link>
            </li>
            <li>
              <Link
                to="https://www.instagram.com/aboayed22/?igshid=YTQwZjQ0NmI0OA%3D%3D"
                target="_blank"
              >
                Instagram
              </Link>
            </li>
            <li>
              <Link to="https://www.facebook.com/Aboayed22" target="_blank">
                Facebook
              </Link>
            </li>
            <li>
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
    </div>
  );
};

export default About;

import { Carousel } from 'flowbite-react';
import schedule from '@assets/svg/schedule.svg';
const Schedule = () => {
  return (
    <div className="max-w-xl h-96 mx-auto mt-[12%]">
      <Carousel pauseOnHover>
        <img src={schedule} alt="..." />
        <img
          src="https://flowbite.com/docs/images/carousel/carousel-2.svg"
          alt="..."
        />
        <img
          src="https://flowbite.com/docs/images/carousel/carousel-3.svg"
          alt="..."
        />
        <img
          src="https://flowbite.com/docs/images/carousel/carousel-4.svg"
          alt="..."
        />
        <img
          src="https://flowbite.com/docs/images/carousel/carousel-5.svg"
          alt="..."
        />
      </Carousel>
    </div>
  );
};

export default Schedule;

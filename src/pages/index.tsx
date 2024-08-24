// src/pages/index.tsx
import type { NextPage } from 'next';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

const Home: NextPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement newsletter signup logic
    console.log('Submitting email:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-10 pb-20">
          <div className="flex flex-col lg:flex-row items-center mb-16">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-5xl font-bold text-gray-800 mb-6">
                Drive Your Dreams in the Dominican Republic
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience the beauty of the Dominican Republic behind the wheel of a luxury vehicle. Book your premium rental car today and elevate your journey.
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition flex items-center">
                Explore Our Fleet
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
            <div className="lg:w-1/2 relative">
              <Image
                src="/images/ferrari.jpg"
                alt="Luxury car on a scenic road"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm font-semibold text-gray-800">Top Rated</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <p className="ml-1 text-sm font-bold text-gray-800">4.9/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Why Choose LuxeDrive?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Fleet</h3>
                <p className="text-gray-600">Choose from our selection of luxury and high-performance vehicles.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">24/7 Support</h3>
                <p className="text-gray-600">Our team is always available to assist you during your rental period.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Pickup</h3>
                <p className="text-gray-600">Choose from multiple convenient locations across the Dominican Republic.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Featured Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['Mercedes-Benz S-Class', 'BMW 7 Series', 'Audi A8'].map((car, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                  <Image
                    src={`/images/car-${index + 1}.jpg`}
                    alt={car}
                    width={300}
                    height={200}
                    className="rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{car}</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-200 rounded-xl shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'John Doe', text: 'LuxeDrive provided an amazing experience! The car was in perfect condition and the service was top-notch.' },
                { name: 'Jane Smith', text: 'I was impressed by the variety of luxury cars available. Will definitely use LuxeDrive again on my next trip!' }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-800">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-xl shadow-md p-8 mb-16 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Summer Special Offer!</h2>
            <p className="text-xl mb-6">Get 15% off on all rentals for stays of 7 days or more. Use code: SUMMER15</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
              Book Now
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Stay Updated with Our Latest Offers</h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center items-center">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:w-auto mb-4 md:mb-0 md:mr-4 px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
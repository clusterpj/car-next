import type { NextPage } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Home: NextPage = () => {
  const [email, setEmail] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setScale((prevScale) => (prevScale === 1 ? 1.05 : 1));
    }, 10000); // Change scale every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement newsletter signup logic
    console.log('Submitting email:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* New Hero Section */}
        <section className="relative h-screen overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ scale }}
            transition={{ duration: 10, ease: "easeInOut" }}
          >
            <Image
              src="/images/ferrari.jpg"
              alt="BMW 5-Series on a scenic road"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </motion.div>
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h2 className="text-5xl font-bold mb-2">2021</h2>
              <h1 className="text-6xl font-bold mb-4">NEW BMW 5-SERIES</h1>
              <p className="text-7xl font-bold text-orange-500 mb-4">$516<span className="text-4xl">/MO</span></p>
              <p className="text-2xl mb-6">FOR 36 MONTH</p>
              <p className="text-lg mb-2">$0 at signing after $1,750 cash back</p>
              <p className="text-lg mb-4">$0 first payment paid by Ford up to $325</p>
              <p className="text-sm mb-6">Taxes, title and fees extra.</p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                LEARN MORE
              </Button>
            </div>
          </div>
        </section>

        {/* Existing Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-10 pb-20">
            <motion.div 
              className="flex flex-col lg:flex-row items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <h1 className="text-5xl font-bold mb-6">
                  Drive Your Dreams in the Dominican Republic
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Experience the beauty of the Dominican Republic behind the wheel of a luxury vehicle. Book your premium rental car today and elevate your journey.
                </p>
                <Button size="lg" className="rounded-full">
                  Explore Our Fleet
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="lg:w-1/2 relative">
                <Image
                  src="/images/ferrari.jpg"
                  alt="Luxury car on a scenic road"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <Card className="absolute -bottom-6 -left-6">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold">Top Rated</p>
                    <div className="flex items-center mt-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <p className="ml-1 text-sm font-bold">4.9/5</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Why Choose LuxeDrive?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { title: "Premium Fleet", description: "Choose from our selection of luxury and high-performance vehicles.", icon: "M5 13l4 4L19 7" },
                      { title: "24/7 Support", description: "Our team is always available to assist you during your rental period.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                      { title: "Flexible Pickup", description: "Choose from multiple convenient locations across the Dominican Republic.", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
                    ].map((feature, index) => (
                      <motion.div 
                        key={index} 
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Featured Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['Mercedes-Benz S-Class', 'BMW 7 Series', 'Audi A8'].map((car, index) => (
                      <Card key={index} className="overflow-hidden">
                        <Image
                          src={`/images/car-${index + 1}.jpg`}
                          alt={car}
                          width={300}
                          height={200}
                          className="w-full object-cover h-48"
                        />
                        <CardContent className="p-4 text-center">
                          <h3 className="text-xl font-semibold mb-2">{car}</h3>
                          <Button variant="outline" className="rounded-full">
                            Book Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">What Our Customers Say</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { name: 'John Doe', text: 'LuxeDrive provided an amazing experience! The car was in perfect condition and the service was top-notch.' },
                      { name: 'Jane Smith', text: 'I was impressed by the variety of luxury cars available. Will definitely use LuxeDrive again on my next trip!' }
                    ].map((testimonial, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                          <p className="font-semibold">- {testimonial.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-16 bg-primary text-primary-foreground">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold mb-4">Summer Special Offer!</h2>
                  <p className="text-xl mb-6">Get 15% off on all rentals for stays of 7 days or more. Use code: SUMMER15</p>
                  <Button variant="secondary" size="lg" className="rounded-full">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Stay Updated with Our Latest Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center items-center">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full md:w-auto mb-4 md:mb-0 md:mr-4"
                      required
                    />
                    <Button type="submit" className="w-full md:w-auto">
                      Subscribe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
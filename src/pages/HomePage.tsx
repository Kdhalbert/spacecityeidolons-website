import React from 'react';
import { InviteRequestForm } from '../components/InviteRequestForm';
import { Platform } from '../types';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">
            Space City Eidolons
          </h1>
          <p className="text-xl mb-6 text-blue-100">
            Houston's Premier Gaming Community
          </p>
          <p className="text-lg max-w-3xl">
            Welcome to Space City Eidolons, a vibrant gaming community based in Houston, Texas. 
            We bring together gamers of all types to share experiences, organize events, and build lasting friendships.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              Space City Eidolons is a diverse community of gamers who share a passion for gaming 
              across all platforms and genres. Whether you're into competitive esports, casual co-op, 
              tabletop RPGs, or anything in between, you'll find like-minded players here.
            </p>
            <p className="text-gray-700">
              We host regular gaming sessions, tournaments, and social events both online and in-person 
              around the Houston area. Our community values inclusivity, respect, and having fun together.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Inclusive:</strong> Gamers of all skill levels, backgrounds, and interests are welcome</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Respectful:</strong> We maintain a positive, harassment-free environment</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Fun-First:</strong> Gaming is about enjoyment and shared experiences</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Community-Driven:</strong> Members help shape events and activities</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join-section" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Join Our Community
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with us on Discord for real-time chat and gaming coordination, 
            or join our Matrix server for a privacy-focused alternative with end-to-end encryption.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Discord Form */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <InviteRequestForm platform={Platform.DISCORD} />
            </div>

            {/* Matrix Form */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <InviteRequestForm platform={Platform.MATRIX} />
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          What to Expect
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gaming Sessions</h3>
            <p className="text-gray-700">
              Regular organized play sessions across various games, from competitive tournaments 
              to casual co-op nights.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Events</h3>
            <p className="text-gray-700">
              LAN parties, movie nights, and social gatherings where we connect beyond the screen.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Game Discovery</h3>
            <p className="text-gray-700">
              Find new games to play and groups to join. Members can request dedicated channels 
              for their favorite games.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


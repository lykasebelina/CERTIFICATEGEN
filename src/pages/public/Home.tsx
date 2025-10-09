import React from "react";
import { Zap, Menu, X, Award, Users, FileText, Globe, ArrowRight, Check, Star, Sparkles, Wand2, Download, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import homeBanner from "../../assets/home_banner.jpg"; 

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    certificates: 0,
    templates: 0,
    users: 0,
    visits: 0
  });

  // Animated counter effect
  useEffect(() => {
    const targetStats = {
      certificates: 125847,
      templates: 250,
      users: 15420,
      visits: 892561
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        certificates: Math.floor(targetStats.certificates * progress),
        templates: Math.floor(targetStats.templates * progress),
        users: Math.floor(targetStats.users * progress),
        visits: Math.floor(targetStats.visits * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen">
     {/* Hero Section */}
<div className="w-full h-screen relative overflow-hidden">
  <img
    src={homeBanner}
    alt="Hero Banner"
    className="absolute inset-0 w-full h-full object-cover object-left lg:object-center"
  />

 <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full text-center sm:text-center lg:text-left">
    {/* Left Column - Hero Content */}
    <div className="space-y-6 lg:space-y-8">
        {/* AI Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-gray-900/90 text-sm font-medium">Powered by AI Technology</span>
        </div>

        {/* Main Heading */}
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-black">Create </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Professional</span>
            <br />
            <span className="text-black">Certificates </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">with AI</span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-xl text-black leading-relaxed max-w-lg mx-auto lg:mx-0">
          Transform your ideas into stunning certificates using advanced AI generation, powerful editing tools, and seamless batch processing capabilities.
        </p>

        {/* CTA Button */}
        <div>
          <button className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25">
            <div className="flex items-center space-x-3 justify-center">
              <Zap className="h-5 w-5 group-hover:animate-pulse" />
              <span>Start Creating</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</div>

             

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the growing community of professionals creating stunning certificates
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl font-bold text-white mb-2">{formatNumber(stats.certificates)}</div>
                <div className="text-gray-300 text-lg">Certificates Generated</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <FileText className="h-12 w-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl font-bold text-white mb-2">{formatNumber(stats.templates)}</div>
                <div className="text-gray-300 text-lg">Templates Available</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl font-bold text-white mb-2">{formatNumber(stats.users)}</div>
                <div className="text-gray-300 text-lg">Active Users</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Globe className="h-12 w-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl font-bold text-white mb-2">{formatNumber(stats.visits)}</div>
                <div className="text-gray-300 text-lg">Total Visits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is CertiGen Section */}
      <section className="py-20 bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 text-sm font-medium">About CertiGen</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">CertiGen?</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                CertiGen is the world's first AI-powered certificate generation platform that revolutionizes how professionals, educators, and organizations create stunning certificates. Our advanced technology combines artificial intelligence with intuitive design tools to deliver professional-grade certificates in minutes, not hours.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">AI-Powered Design</h3>
                    <p className="text-gray-600">Advanced algorithms create unique, professional layouts automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Batch Processing</h3>
                    <p className="text-gray-600">Generate thousands of certificates simultaneously with CSV import</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Cloud Storage</h3>
                    <p className="text-gray-600">Secure, accessible certificate storage with instant sharing capabilities</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="h-4 bg-white/30 rounded w-3/4"></div>
                    <div className="h-4 bg-white/30 rounded w-1/2"></div>
                    <div className="h-32 bg-white/20 rounded-xl flex items-center justify-center">
                      <Award className="h-16 w-16 text-white/60" />
                    </div>
                    <div className="h-4 bg-white/30 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 mb-6">
              <Wand2 className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800 text-sm font-medium">Process</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">CertiGen</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create professional certificates in just three simple steps with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Template</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Select from 250+ professionally designed templates or let our AI create a custom design based on your preferences and requirements.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customize & Edit</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Use our intuitive editor to personalize text, colors, logos, and layouts. Bulk import recipient data via CSV for mass generation.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Download & Share</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Generate high-quality PDFs instantly. Share via email, download in bulk, or store securely in the cloud for future access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create, manage, and distribute professional certificates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Zap className="h-12 w-12 text-yellow-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">AI Generation</h3>
              <p className="text-gray-300">Advanced AI creates unique designs tailored to your needs and industry standards.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Download className="h-12 w-12 text-green-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Batch Processing</h3>
              <p className="text-gray-300">Generate thousands of certificates simultaneously with CSV import functionality.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Share2 className="h-12 w-12 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Easy Sharing</h3>
              <p className="text-gray-300">Share certificates via email, social media, or generate shareable links instantly.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Globe className="h-12 w-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Cloud Storage</h3>
              <p className="text-gray-300">Secure cloud storage with unlimited access to your certificate library.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Award className="h-12 w-12 text-orange-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Professional Quality</h3>
              <p className="text-gray-300">High-resolution PDFs suitable for printing and digital distribution.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Users className="h-12 w-12 text-pink-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Team Collaboration</h3>
              <p className="text-gray-300">Collaborate with team members and manage permissions effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Our Team</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Innovators</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our passionate team of designers, developers, and AI specialists dedicated to revolutionizing certificate creation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {/* Existing three team members */}
  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <Users className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Lyka Mae Sebelina</h3>
    <p className="text-blue-600 text-center mb-4">Project Manager</p>
    <p className="text-gray-600 text-center">A natural leader with a knack for bringing ideas to life and keeping the team motivated to achieve big things.</p>
  </div>

  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <Users className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Jonalyn Ramos</h3>
    <p className="text-green-600 text-center mb-4">UI/UX Designer</p>
    <p className="text-gray-600 text-center">Creative thinker with an eye for design, turning concepts into visually stunning and user-friendly experiences.</p>
  </div>

  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <Users className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Nina Luisa Astillero</h3>
    <p className="text-purple-600 text-center mb-4">Frontend Developer</p>
    <p className="text-gray-600 text-center">Innovative coder who transforms ideas into interactive, engaging, and dynamic web interfaces.</p>
  </div>

  {/* Fourth team member */}
  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Users className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Salve Villanueva</h3>
    <p className="text-pink-600 text-center mb-4">Backend Developer</p>
    <p className="text-gray-600 text-center">Problem-solver passionate about building smart, reliable systems that make projects run smoothly.</p>
  </div>


          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">Users Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"CertiGen saved me hours of work. The AI-generated designs are incredibly professional, and the batch processing feature is a game-changer for our training programs."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MJ</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Maria Johnson</h4>
                  <p className="text-gray-600 text-sm">Training Manager, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"As an educator, I love how easy it is to create beautiful certificates for my students. The templates are diverse and the customization options are endless."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">RT</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Robert Thompson</h4>
                  <p className="text-gray-600 text-sm">High School Principal</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"The quality of certificates from CertiGen is outstanding. Our clients are always impressed with the professional appearance and attention to detail."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">LP</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Lisa Park</h4>
                  <p className="text-gray-600 text-sm">Event Coordinator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Create Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Certificates?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join thousands of professionals who trust CertiGen for their certificate needs. Start creating today and experience the future of certificate generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-cyan-500/25">
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 group-hover:animate-pulse" />
                  <span>Start Creating</span>
                </div>
              </button>
              
              <button className="group bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-4 rounded-2xl text-xl font-semibold hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
                  <span>View Demo</span>
                </div>
              </button>
            </div>
            
            <p className="text-gray-400 mt-6 text-lg">
              Free to use • Unlimited access • Get started instantly
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
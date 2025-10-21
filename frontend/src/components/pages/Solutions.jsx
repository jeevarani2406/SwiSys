import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

const Solutions = ({ language }) => {
  const [solutionsContent, setSolutionsContent] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // top-level section
  const [expandedSubSection, setExpandedSubSection] = useState(null); // sub-item

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await import('@/content/solutions/content.json');
        setSolutionsContent(response.default);
      } catch (error) {
        console.error('Error loading solutions content:', error);
      }
    };
    loadContent();

    // Check for stored content on mount
    const storedContent = localStorage.getItem('solutionContent');
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent);
        setSolutionsContent(prev => ({
          ...prev,
          current: parsedContent
        }));
      } catch (error) {
        console.error('Error parsing stored content:', error);
      }
    }
  }, []);

  // Example content for sub-items
  const subItemContent = {
    'cs8959-evb': {
      title: 'CS8959 EVB',
      description: language === 'en'
        ? 'The CS8959 EVB is an evaluation board specifically designed for applications in automotive electronics, including CAN 2.0 Bus technology, an in-vehicle serial communication network controller that can effectively enable distributed control and real-time monitoring.'
        : 'CS8959 EVB 是專為汽車電子應用而設計的評估板，包括 CAN 2.0 總線技術，可有效實現分布式控制和實時監控的車載串行通信網絡控制器。',
      overview: language === 'en'
        ? 'The CS8959 EVB has two CAN buses that can be used for automotive body control units and gateway control units.'
        : 'CS8959 EVB 具有兩個 CAN 總線，可用於汽車車身控制單元和網關控制單元。',
      Productdescriptions : [ 
        'Compatible to ISO 11898-2', 
        'Co-Work with MysonCentury',
        'Easy tool for developing CAN Bus application', 
        'Rich teaching material (Manual, example codes, PPT) ' 
      ]
    },
    'cs8979-evb': {
      title: 'CS8979 EVB',
      description: language === 'en'
        ? 'CS8979 EVB provides robust CAN bus evaluation with enhanced EMC protection.'
        : 'CS8979 EVB 提供強大的 CAN 總線評估功能，具有增強的 EMC 保護。',
      features: [
        'High Reliability',
        'Real-time Data Logging',
        'Temperature Range: -40°C to 125°C',
      ]
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {language === 'en' ? 'Our Solutions' : '我們的解決方案'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Comprehensive automotive solutions for your specific needs'
              : '滿足您特定需求的全面汽車解決方案'}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Automotive MCU Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'en' ? 'Automotive MCU' : '汽車微控制器'}
              </h2>
              <div className="space-y-4">
                <div>
                  <div
                    className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600"
                    onClick={() => setExpandedSection('issi-mcu')}
                  >
                    <span className="mr-2">
                      {expandedSection === 'issi-mcu' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    ISSI MCU
                  </div>
                  {expandedSection === 'issi-mcu' && (
                    <div className="ml-6 mt-2 bg-gray-50 p-4 rounded-lg shadow-inner animate-fadeIn">
                      <p className="text-gray-700 mb-4">High-performance automotive MCU solutions with advanced features for reliable operation.</p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li className="ml-4">32-bit ARM core architecture</li>
                          <li className="ml-4">Wide operating voltage range</li>
                          <li className="ml-4">Enhanced EMC protection</li>
                        </ul>
                      </div>
                      <Link 
                        href="/solutions/automotive-mcu/issi-mcu"
                        className="group inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {language === 'en' ? 'View Details' : '查看詳情'}
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600"
                    onClick={() => setExpandedSection('megawin-mcu')}
                  >
                    <span className="mr-2">
                      {expandedSection === 'megawin-mcu' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    Megawin MCU
                  </div>
                  {expandedSection === 'megawin-mcu' && (
                    <div className="ml-6 mt-2 bg-gray-50 p-4 rounded-lg shadow-inner animate-fadeIn">
                      <p className="text-gray-700 mb-4">Advanced microcontroller solutions optimized for automotive applications and control systems.</p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li className="ml-4">High-speed processing capabilities</li>
                          <li className="ml-4">Integrated safety features</li>
                          <li className="ml-4">Extended temperature range</li>
                        </ul>
                      </div>
                      <Link 
                        href="/solutions/automotive-mcu/megawin-mcu"
                        className="group inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {language === 'en' ? 'View Details' : '查看詳情'}
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CAN Bus ECU Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'en' ? 'CAN Bus ECU' : 'CAN總線ECU'}
              </h2>

              {/* CAN EVB */}
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'CAN EVB' : 'CAN評估板'}
                </h3>
                <ul className="space-y-2 pl-4">
                  {['cs8959-evb', 'cs8979-evb'].map((id) => (
                    <li key={id}>
                      <div
                        className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600"
                        onClick={() => setExpandedSubSection(expandedSubSection === id ? null : id)}
                      >
                        <span className="mr-2">
                          {expandedSubSection === id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                        {subItemContent[id].title}
                      </div>

                      {/* Expandable Content */}
                      {expandedSubSection === id && (
                        <div className="ml-6 mt-2 bg-gray-50 p-4 rounded-lg shadow-inner animate-fadeIn">
                          <p className="text-gray-700 mb-4">{subItemContent[id].description}</p>
                          {subItemContent[id].overview && (
                            <p className="text-blue-700 mb-4 bg-blue-50 p-3 rounded">
                              {subItemContent[id].overview}
                            </p>
                          )}
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Key Features:</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                              {subItemContent[id].features.map((feat, idx) => (
                                <li key={idx} className="ml-4">{feat}</li>
                              ))}
                            </ul>
                          </div>
                          <Link 
                            href={`/solutions/can-bus-ecu/can-evb/${id}`}
                            className="group inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              localStorage.setItem('solutionContent', JSON.stringify(subItemContent[id]));
                            }}
                          >
                            {language === 'en' ? 'View Details' : '查看詳情'}
                            <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instruments Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'en' ? 'Instruments' : '儀器'}
              </h2>
              <div className="space-y-4">
                <div>
                  <div
                    className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600"
                    onClick={() => setExpandedSection('diagnostic')}
                  >
                    <span className="mr-2">
                      {expandedSection === 'diagnostic' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    {language === 'en' ? 'Diagnostic Tools' : '診斷工具'}
                  </div>
                  {expandedSection === 'diagnostic' && (
                    <div className="ml-6 mt-2 bg-gray-50 p-4 rounded-lg shadow-inner animate-fadeIn">
                      <p className="text-gray-700 mb-4">Professional diagnostic tools for comprehensive vehicle analysis and troubleshooting.</p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li className="ml-4">Multi-protocol support</li>
                          <li className="ml-4">Real-time data monitoring</li>
                          <li className="ml-4">Advanced diagnostic capabilities</li>
                        </ul>
                      </div>
                      <Link 
                        href="/solutions/instruments/diagnostic"
                        className="group inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {language === 'en' ? 'View Details' : '查看詳情'}
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600"
                    onClick={() => setExpandedSection('testing')}
                  >
                    <span className="mr-2">
                      {expandedSection === 'testing' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    {language === 'en' ? 'Testing Equipment' : '測試設備'}
                  </div>
                  {expandedSection === 'testing' && (
                    <div className="ml-6 mt-2 bg-gray-50 p-4 rounded-lg shadow-inner animate-fadeIn">
                      <p className="text-gray-700 mb-4">Comprehensive testing equipment for automotive system validation and quality assurance.</p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li className="ml-4">High-precision measurements</li>
                          <li className="ml-4">Environmental testing capabilities</li>
                          <li className="ml-4">Data logging and analysis</li>
                        </ul>
                      </div>
                      <Link 
                        href="/solutions/instruments/testing"
                        className="group inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {language === 'en' ? 'View Details' : '查看詳情'}
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;

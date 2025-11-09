import Link from 'next/link';
import { ArrowLeft, ExternalLink, Download, FileText } from 'lucide-react';
import Image from 'next/image';

export default async function ProductPage({ params }) {
  // ✅ Await params in Next.js 15+
  const { category, subcategory, product } = await params;

  // Product content map with download links and additional resources
  const productContentMap = {
    // CAN Bus ECU - CAN EVB products
    'CS8959': {
      title: 'CS8959 EVB',
      description:
        'The CS8959 EVB is an evaluation board specifically designed for automotive electronics applications featuring CAN 2.0 Bus technology. It functions as an in-vehicle serial communication network controller, enabling effective distributed control and real-time monitoring.',
      image: '/cs8959 evb.jpeg',
      features: [
        'MCU: MysonCentury CS8959',
        '2 CAN Port: Microchip MCP2551 (Including 120Ω Terminal Resistor)',
        '2 RS-232 Port (Male x1 & Female x1)',
        '4x4 Matrix keyboard, ADC, EEPROM, 5x7 LED, 4-bit Seven-segment display, LED x2 (Monochrome LED & Full color LED), Text type LCD, 8-bit DIP switch, Buzzer, Infrared receiver, Temperature sensor (DS18B20)',
        'Power supply via USB interface',
      ],
      specifications: {
        'Power Supply': 'DC 5V',
        'Working Current': '< 100mA',
        'Operation Temperature': '0℃ to 70℃',
        Dimensions: '120 x 115 x 14.5 mm',
        Weight: '180g',
      },
      downloads: {
        'SwiSys_CAN-Bus_EVB_Flyers-EN_F1611-031':
          '/Downloads/SwiSys_CAN-Bus_EVB_Flyers-EN_F1611-031.pdf',
        'SwiSys_CAN-Bus_EVB&ECU_Flyers-EN_F1611-012':
          '/Downloads/SwiSys_CAN-Bus_EVB&ECU_Flyers-EN_F1611-012.pdf',
      },
    },

    'cs8972': {
      title: 'CS8972 EVB',
      description:
        'The CS8972 EVB is a stand-alone Controller Area Network (CAN) protocol controller with the embedded CAN transceiver...',
      image: '/CS8972 EVB.jpeg',
      downloads: {
        Datasheet: '/downloads/cs8972-datasheet.pdf',
        'Quick Start Guide': '/downloads/cs8979-quick-start.pdf',
      },
    },

    'cs8961': {
      title: 'CS8961 ECU',
      description:
        'The CS8961 ECU is an evaluation board specifically designed for automotive electronics applications featuring CAN 2.0 Bus technology...',
      image: '/cs8961 ecu.jpg',
      features: [
        'Compatible to ISO 11898-2',
        'Co-Work with MysonCentury',
        'IR, Voltage, Gas, Ultrasonic, Temperature, Humidity',
        'Easy tool for developing CAN node application',
        'Rich teaching material (Manual, example codes)',
        'Applicable to evaluate CAN conformance',
      ],
      specifications: {
        'Power Supply': 'DC 5V',
        'Working Current': '< 100mA',
        'Operation Temperature': '0℃ to 70℃',
        Dimensions: '120 x 115 x 14.5 mm',
        Weight: '180g',
      },
      downloads: {
        'SwiSys_CAN-Bus_EVB_Flyers-EN_F1611-031':
          '/Downloads/SwiSys_CAN-Bus_EVB_Flyers-EN_F1611-031.pdf',
        'SwiSys_CAN-Bus_EVB&ECU_Flyers-EN_F1611-012':
          '/Downloads/SwiSys_CAN-Bus_EVB&ECU_Flyers-EN_F1611-012.pdf',
      },
    },

    // (Your other products remain unchanged — OBD Bridge, J1939, CCP, CAN, etc.)
    // You don’t need to modify any of their details.
  };

  // Get product content (case-insensitive)
  const productContent =
    productContentMap[product] ||
    Object.entries(productContentMap).find(
      ([key]) => key.toLowerCase() === product.toLowerCase()
    )?.[1];

  // If product not found, show 404-like message
  if (!productContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The product &quot;{product}&quot; was not found in the {category}/
            {subcategory} category.
          </p>
          <Link
            href="/solutions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Solutions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center mb-4">
            <Link
              href="/solutions"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Solutions
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {productContent.title}
          </h1>
          <div className="text-blue-200">
            <span className="capitalize">{category.replace(/-/g, ' ')}</span>
            <span className="mx-2">/</span>
            <span className="capitalize">
              {subcategory.replace(/-/g, ' ')}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-2 space-y-8">
            {productContent.image && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={productContent.image}
                    alt={productContent.title}
                    width={800}
                    height={500}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
                <p className="text-center text-gray-500 text-sm mt-2">
                  {productContent.title} - Product Image
                </p>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {productContent.description}
              </p>
            </div>

            {/* Features */}
            {productContent.features && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <ul className="space-y-3">
                  {productContent.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Downloads */}
            {productContent.downloads && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Downloads</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(productContent.downloads).map(
                    ([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        download
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                      >
                        <Download className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                            {name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {url.split('.').pop()?.toUpperCase()} • Click to
                            download
                          </div>
                        </div>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              {productContent.specifications ? (
                <div className="space-y-4">
                  {Object.entries(productContent.specifications).map(
                    ([k, v]) => (
                      <div key={k} className="border-b border-gray-200 pb-3">
                        <dt className="font-semibold text-gray-900">{k}</dt>
                        <dd className="text-gray-600 mt-1">{v}</dd>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Specifications not available</p>
              )}

              <div className="mt-8 space-y-4">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Request Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ✅ Generate static params for build-time routes
export async function generateStaticParams() {
  return [
    { category: 'can-bus-ecu', subcategory: 'can-evb', product: 'CS8959' },
    { category: 'can-bus-ecu', subcategory: 'can-evb', product: 'cs8972' },
    { category: 'can-bus-ecu', subcategory: 'can-evb', product: 'cs8961' },
    { category: 'can-bus-ecu', subcategory: 'light-duty-obdii', product: 'obd-bridge' },
    { category: 'can-bus-ecu', subcategory: 'heavy-duty-j1939', product: 'j1939-bridge' },
    { category: 'can-bus-ecu', subcategory: 'heavy-duty-j1939', product: 'j1939-recorder' },
    { category: 'can-bus-ecu', subcategory: 'can-gateway', product: 'can-to-uart' },
    { category: 'can-bus-ecu', subcategory: 'can-probes', product: 'CCP' },
    { category: 'instruments', subcategory: 'signal-generator', product: 'can' },
    { category: 'instruments', subcategory: 'signal-generator', product: 'j1939' },
  ];
}

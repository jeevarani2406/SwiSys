import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function ProductPage({ params }) {
  const { category, subcategory, product } = params;

  // Product content map - maps each product key to its descriptive content
  const productContentMap = {
    // CAN Bus ECU - CAN EVB products
    'cs8959': {
      title: 'CS8959 EVB',
      image: '/public/CS8959-EVB.jpg',
      description: 'The CS8959 EVB is an evaluation board specifically designed for automotive electronics applications featuring CAN 2.0 Bus technology. It functions as an in-vehicle serial communication network controller, enabling effective distributed control and real-time monitoring.',
      features: [
        'MCU: MysonCentury CS8959',
        '2 CAN Port: Microchip MCP2551 (Including 120Ω Terminal Resistor)',
        '2 RS-232 Port (Male x1 & Female x1)',
        '4x4 Matrix keyboard, ADC, EEPROM, 5x7 LED, 4-bit Seven-segment display, LED x2 (Monochrome LED & Full color LED), Text type LCD, 8-bit DIP switch, Buzzer, Infrared receiver, Temperature sensor (DS18B20)',
        'Power supply via USB interface'        
      ],
      specifications: {
        'Power Supply': 'DC 5V',
        'Working Current': '< 100mA',
        'Operation Temperature': '0℃ to 70℃',
        'Dimensions': '120 x 115 x 14.5 mm',
        'Weight': '180g'
      }
    },
    'cs8979': {
      title: 'CS8979 EVB',
      description: 'The CS8972 EVB is a stand-alone Controller Area Network (CAN) protocol controller with the embedded CAN transceiver. The CAN transceiver meets or exceeds ISO 11898 standards. As CAN transceivers, these devices provide differential transmit and receive capability as signaling rates up to 1 Mb/s for a CAN controller. It is capable of transmitting and receiving standard and extended message frames. It includes eight independent auto-dispatch and 1024-byte transmit buffers, FIFO receives filtering with 12 ID acceptance and message management. The MCU communication is implemented via an industry standard Serial Peripheral Interface (SPI) and an I2C bus.',
    }, 
    'cs8961': {
      title: 'CS8961 ECU',
      description: 'The CS8961 ECU is an evaluation board specifically designed for automotive electronics applications featuring CAN 2.0 Bus technology. It functions as an in-vehicle serial communication network controller, enabling effective distributed control and real-time monitoring.',
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
        'Dimensions': '120 x 115 x 14.5 mm',
        'Weight': '180g'
      }
    },
    'obd-bridge': {
      title: 'OBD-Bridge',
      description: 'SWISYS Light Duty - OBDII Bridge, which is an In-Vehicle-Infotainment (IVI) cost-competitive product. To get vehicle information on the CAN Bus, there is a CAN transceiver that has CAN H and CAN L signal pins. Information about the CAN Bus will be transmitted to the MCU through the SPI interface. A Bluetooth module JDY-23 is connected to the MCU using the UART interface. Depending on system integration requirements, the Bluetooth module can be removed for hard-wired applications through the UART interface. We also provide『OBDII Bluetooth Receiver』hardware for wireless applications.',
      features: [
        'Supports both CAN 2.0A and CAN 2.0B (ISO 11898) and meets OBDII (ISO 15765) standard.',
        'Provides standard OBDII and proprietary SwiSys command sets for accessing vehicle data.',
        'Offers ESG-based data processing for fuel economics, including instantaneous, trip, and idle time calculations.',        
        'Optional interfaces: UART, Bluetooth, USB, 3G/4G, LoRa, NBIoT, and contactless CAN probe.',
        'Compliance with automotive EMS test levels: BCI, EFT, and ESD.',
        'Integrated Bluetooth SDK/API for iOS and Android app development.'
      ],
      specifications: {
        'Operating voltage': 'DC 9V to 25V',
        'Standby/Operation Current': '3mA / <60mA',
        'Operating temperature': '-20°C to +70°C',
        'Bluetooth Protocol': '3.0 SPP + BLE',
        'Dimensions': '50 x 20 x 26 mm',
        'Weight': '35g'
      }
    },
    
    'j1939-bridge': {
      title: 'J1939 Bridge',
      description: 'SWISYS Heavy Duty - J1939 Bridge, is a high-level communications protocol, which operates on a Controller Area Network (CAN) bus, which is an In-Vehicle-Infotainment (IVI) cost competitive product. The hardware design is based on our SAE J1939 / OBD-II Device with Bluetooth to get vehicle information such as speed, engine speed, coolant temperature, IAT sensor, APP, MAP, vehicle identification code (VIN), etc. J1939 Bridge contains three parts they are off, CAN Transceiver (TJA1050), main controller (RL78 MCU), and  Bluetooth transmission module (HC-05). J1939 doubles the data transmission rate from 250 Kbit/s to 500 Kbit/s.',
      features: [
        'Provides important vehicle data like speed, temperature, RPM, pedal position, tire info, distance, and fuel usage.',
        'Offers different command options for basic use, advanced fleet management, and custom system integration.',
        'Works easily with IoT devices like Bluetooth, USB, 3G/4G, LoRa, NBIoT, and has an optional contactless CAN probe.',
        'Small and easy-to-install device (50x20x21mm).',
        'Meets automotive test standards and works with over 200 vehicle brands.'
      ],
      specifications: {
        'Operating Voltage' : '12V DC',
        'Dimensions' : '50 × 20 × 21 mm (may vary depending on connector)',
        'Connectivity Options' : 'Bluetooth, USB, 3G/4G, LoRa, NB-IoT, optional Contactless CAN Probe (CCP)',
        'Compliance' : 'Automotive EMS test levels – BCI (ISO 11452-4), EFT (IEC 61000-4-4), ESD (IEC 61000-4-2)',
        'Compatible Vehicles': 'Supports >200 brands/models including ADL, DAF, DAEWOO, FUSO, HINO, IVECO, KING LONG, SCANIA, VOLVO, YUTONG'
      }
    },

    'j1939-recorder': {
      title: 'J1939 Recorder',
      description: 'The product J1939-DBR has two high performance independent CAN communication channels that can be configured to store either CAN or J1939 data concurrently. The J1939 data can be accessed via actively or passive mode on any parameters specified by customers. This product is beneficial to ADAS (Advanced Driving Assistant System) or FMS (Fleet Management System) product development for heavy duty vehicles. The hardware is also applicable for the IVN(In-Vehicle-Networking) gateway design with firmware design by request.',
      features: [
        'Supports Dual CAN Bus communication with CAN 2.0A and 2.0B (ISO 11898-2)',
        'Records SAE J1939 protocol with access to over 30 SPN data points',
        'Supports ISO 11898-2 raw CAN data logging',
        'Expandable storage using 8GB to 256GB Class 10 MicroSD cards',
        'Multiple monitoring interfaces: Bluetooth (2.0 & 4.0), J1962 port, and optional Contactless CAN Probe',
        'Compliant with automotive EMS standards (BCI, EFT, ESD) for durability and reliability'
      ],
      specifications: {
        'Power Consumption' : '<5W',
        'Speed' : '5Kbit/s to 1Mbit/s',
        'Operation Temperature' : '0℃ to 70℃',
        'Dimension' : 'H35 x W73 x D125 (mm)',
        'Capacity' : 'Require 32 GB up to 256GB',
        'Weight': '400g'
      }
    },

    'can-to-uart': {
      title: 'CAN - UART Converter',
      description: 'The CAN  to UART converter is a USB-based serial TTL communication device for reading CAN messages. It accesses programmable CAN and UART baud rates. On the PCB board, there are LEDs which display TX and RX signal lines. The standard supports baud rates ranging from 10 KB/s to 1 MB/s. Read all CAN Bus signals, such as CANOpen and J1939. This system is suitable for for connecting PCs and tablets. The CAN to UART converter compatible with the ISO 11898 standard.',
      features: [
        'Protocols Supported: CAN 2.0A and CAN 2.0B',
        'CAN Bit Rate: Adjustable from 100 kbps to 1 Mbps',
        'Dimensions: 33 × 17.8 × 2.7 mm (optional housing)',
        'Compliance: Automotive EMS test levels – BCI (ISO 11452-4), EFT (IEC 61000-4-4), ESD (IEC 61000-4-2)',
        'Connectivity & Integration: Bridges CAN Bus and UART; supports BT, USB, 3G/4G, LoRa, NB-IoT, and optional Contactless CAN Probe (CCP)'
      ],
      specifications: {
        'Power Supply': 'DC 7V',
        'Working Current': '< 12mA (1mA @Sleep mode)',
        'Bit Rate(CAN)': '125K, 250K, 500K, 1Mbps',
        'Baud Rate': '38400, 57600, 115200, 230400, 460800, 921600, 1382400 bps...',
        'Support Protocol': 'CAN 2.0A / CAN 2.0B',
        'Dimensions' : '33.0 x 17.8 x 2.7 (mm)',
        'Weight': '8g',
        'Operation Temperature': '-25 ~ +75℃'
      }
    },

    'CCP': {
      title: 'Contactless CAN Probe',
      description: 'The Contactless CAN Bus Probe is a highly reliable and non-intrusive solution designed for real-time monitoring of CAN bus communication in vehicles and industrial automation systems. It enables users to sniff and analyze CAN signals without physically connecting to or interrupting the wiring, ensuring safe and efficient diagnostics. This probe supports one-port CAN Bus communication and is fully compliant with ISO 11898 standards, supporting both CAN 2.0A (11-bit) and CAN 2.0B (29-bit) formats. It is seamlessly compatible with other SWISYS products such as CAN to UART converters, OBD-II bridges, and J1939 bridges, enhancing system integration capabilities.',
      features: [
        'Suitable for CAN Bus data monitoring Transportation, Industry Automation',
        'Snifferring vehicle CAN bus data without connecting the signal wires',
        'Patented robust encapsulation to prevent environment stressing (Humidity,Dust, Temperature, Electricity, Shock…)',
        'Easy to install and operate',
        'Support 1 port CAN Bus channel',
        'Compatible with the ISO 11898 standard (CAN 2.0A/11-bit and CAN 2.0B/29 bit)'        
      ],
      specifications: {
        'Max operating current': '≤ 8 mA (@28 V)',
        'Dimensions' : '40 x 20 x 10 (mm)',
        'Operation Temperature' : '-25 to 85 °C (-13 to185 °F)',
        'Operating humidity' : '≤ 85 % (no condensation)',
        'Operating voltage' : '+9 to +36 VDC'
      }
    },
  
    // Instruments products
    'can': {
      title: 'CAN Signal generator',
      description: 'CAN Bus Signal Generator (CAN Emulator) is an instrument that can help customers simulate CAN signals which comply with ISO 11898. This product contains four adjustable knobs which can be used to gather CAN data from the vehicle"s source. In addition, a mode selection switch for changing the CAN signal output mode, and the power supply is powered by USB. The CAN signal output interface takes the wiring clip form, which enables users to read the CAN signal for analysis.',
      features: [
        '2 Pin CAN Bus Interface Connector',
        '4 Adjustable Knobs',
        '2 Toggle Switches',
        '120Ω Terminal Resistor Switch',
        'CAN Update Speed > 10ms',
        'CAN Transceiver：TJA 1050',
        'CAN Protocol：ISO 11898'
      ],
      specifications: {
        'Power Supply': 'DC 5V',
        'Working Current': '< 50mA',
        'Operation Temperature': '0℃ to 70℃',
        'Dimensions': '123 x 114 x 34 (mm)',
        'Weight': '221g'
      }
    },
    'lin': {
      title: 'Lin Signal Generator',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },
    'obdii': {
      title: 'OBDII Signal Generator',
      description: 'Professional automotive multimeter with specialized functions for automotive electrical system testing and diagnostics.',
      overview: 'High-precision multimeter with automotive-specific measurement capabilities and enhanced safety features.',
      features: [
        'High precision measurements',
        'Automotive-specific functions',
        'Safety features and protection',
        'Data logging capabilities',
        'Backlit display',
        'Auto-ranging functionality',
        'Professional-grade reliability'
      ],
      specifications: {
        'DC Voltage': '0.1mV - 1000V',
        'AC Voltage': '0.1mV - 750V',
        'DC Current': '0.1µA - 10A',
        'Resistance': '0.1Ω - 100MΩ',
        'Display': '4-digit LCD',
        'Safety': 'CAT III 1000V',
        'Operating Temperature': '-10°C to +50°C'
      }
    },
    'j1939': {
      title: 'J1939 Signal Generator',
      description: 'J1939 signal generator is a high-level communications protocol, which operates on a Controller Area Network (CAN) Bus. This is useful for the development of the SAE J1939 reader. It can work independently on a PC, without additional software. Eight PGN/SPN data can be manually calibrated for each potentiometer, in two sets. It defines the data priority, size, scaling, and offset. A MIL indicator is provided for displaying the DTC status, which can be triggered by a switch. The standard goes on to define many other aspects, including message timeouts, how large messages are fragmented and reassembled, the network speed, the physical layer, and how applications acquire network addresses. J1939 simulator compliant vehicle signals are suitable for connecting PCs, smart phones, and tablets.',
      features: [
        'Compatible with J1939 Standard for heavy duty vehicle',
        'CAN 2.0B 29bit with 250kB Baud',
        'Support J1979 complaint" DMs',
        'Support more than 8 live data',
        'Upgradeable firmware to simulate different PGNs',
        'ECU source address is 0x00',

      ],
      specifications: {
        'Power Supply': '+7VDC ~ +30VDC',
        'Working Current': '<100mA',
        'Dimensions': '114 x 33 x 120 (mm)',
        'Connector': 'J1962 Female',
        'weight': '350g',
        'Operating Temperature': '0°C to 70°C'
      }
    },

    'logic-cube-pro': {
      title: 'Logic cube pro',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },

    'logic-cube': {
      title: 'logic cube',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },

    'logic-educator': {
      title: 'Logic educator',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },

    'f1': {
      title: 'Logic analyzer-F1',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },

    'bus-expert-ii': {
      title: 'Bus Expert II with eMMC + SD3.0',
      description: 'High-performance oscilloscope specifically designed for automotive electrical system analysis and troubleshooting.',
      overview: 'Professional-grade oscilloscope with automotive-specific features and comprehensive analysis capabilities.',
      features: [
        'High bandwidth and sampling rate',
        'Automotive-specific measurements',
        'Advanced triggering capabilities',
        'Multi-channel analysis',
        'Automated measurements',
        'Waveform analysis tools',
        'Data logging and export'
      ],
      specifications: {
        'Bandwidth': 'Up to 200MHz',
        'Channels': '4',
        'Sampling Rate': 'Up to 1GS/s',
        'Memory Depth': 'Up to 1M points',
        'Display': '10.1-inch touchscreen',
        'Connectivity': 'USB, Ethernet, WiFi',
        'Operating Temperature': '-10°C to +50°C'
      }
    },
  };

  // Get product content based on the product parameter
  const productContent = productContentMap[product];

  // If product not found, show 404-like content
  if (!productContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The product "{product}" was not found in the {category}/{subcategory} category.
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
          <h1 className="text-4xl font-bold mb-2">{productContent.title}</h1>
          <div className="text-blue-200">
            <span className="capitalize">{category.replace(/-/g, ' ')}</span>
            <span className="mx-2">/</span>
            <span className="capitalize">{subcategory.replace(/-/g, ' ')}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{productContent.description}</p>
            </div>

            {/* Overview */}
            {productContent.overview && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-blue-800">{productContent.overview}</p>
                </div>
              </div>
            )}

            {/* Features */}
            {productContent.features && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <ul className="space-y-3">
                  {productContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Specifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              {productContent.specifications ? (
                <div className="space-y-4">
                  {Object.entries(productContent.specifications).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-3">
                      <dt className="font-semibold text-gray-900">{key}</dt>
                      <dd className="text-gray-600 mt-1">{value}</dd>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Specifications not available</p>
              )}
             
              {/* Contact/Inquiry Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
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

// Generate static params for SEO and prebuilding
export async function generateStaticParams() {
  // Define all possible product combinations
  const productRoutes = [
    // CAN Bus ECU - CAN EVB
    { category: 'can-bus-ecu', subcategory: 'can-evb', product: 'cs8959' },
    { category: 'can-bus-ecu', subcategory: 'can-evb', product: 'cs8979' },
    { category: 'can-bus-ecu', subcategory: 'light duty-OBDII', product: 'obd-bridge' },
    { category: 'can-bus-ecu', subcategory: 'light duty-OBDII', product: 'obd-recorder' },
    { category: 'can-bus-ecu', subcategory: 'heavy duty-J1939', product: 'j1939-bridge' },
    { category: 'can-bus-ecu', subcategory: 'heavy duty-J1939', product: 'j1939-recorder' },
    { category: 'can-bus-ecu', subcategory: 'can gateway', product: 'can-to-can' },
    { category: 'can-bus-ecu', subcategory: 'can gateway', product: 'can-to-uart' },
  
    // Instruments
    { category: 'instruments', subcategory: 'signal generator', product: 'can' },
    { category: 'instruments', subcategory: 'signal generator', product: 'lin' },
    { category: 'instruments', subcategory: 'signal generator', product: 'obdii' },
    { category: 'instruments', subcategory: 'signal generator', product: 'j1939' },
    { category: 'instruments', subcategory: 'logic Analyzer', product: 'logic-cube-pro' },
    { category: 'instruments', subcategory: 'logic Analyzer', product: 'logic-cube' },
    { category: 'instruments', subcategory: 'logic Analyzer', product: 'logic-educator' },
    { category: 'instruments', subcategory: 'logic Analyzer', product: 'f1' },
    { category: 'instruments', subcategory: 'logic Analyzer', product: 'bus-expert-ii' },
   
  ];

  return productRoutes;
}

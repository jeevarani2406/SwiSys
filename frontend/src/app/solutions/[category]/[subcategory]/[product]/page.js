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
        'The CS8972 EVB is a stand-alone Controller Area Network (CAN) protocol controller with the embedded CAN transceiver. The CAN transceiver meets or exceeds ISO 11898 standards. As CAN transceivers, these devices provide differential transmit and receive capability as signaling rates up to 1 Mb/s for a CAN controller. It is capable of transmitting and receiving standard and extended message frames. It includes eight independent auto-dispatch and 1024-byte transmit buffers, FIFO receives filtering with 12 ID acceptance and message management. The MCU communication is implemented via an industry standard Serial Peripheral Interface (SPI) and an I2C bus. ',
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
    
    'obd-bridge': {
      title: 'OBD Bridge',
      description:
        'SWISYS Light Duty – OBDII Bridge, which is an In-Vehicle-Infotainment (IVI) cost competitive product. To get vehicle information on CAN Bus, there is a CAN transceiver that has CAN H and CAN L signal pins. Information about the CAN Bus will be transmitted to the MCU through the SPI interface. A Bluetooth module JDY-23 is connected to MCU using the UART interface. Depending on system integration requirements, the Bluetooth module can be removed for hard wired applications through UART interface. We also provide『OBDII Bluetooth Receiver』hardware for wireless applications.',
      image: '/obd-bridge.jpeg',
      features: [
        'Supports CAN 2.0A/B & OBDII standards.',
        'Offers UART, BT, USB, 3G/4G, LoRa, NB-IoT interfaces.',
        'Provides standard & proprietary command sets.',
        'Includes ESG-based fuel economy analysis.',
        'Complies with BCI, EFT, and ESD standards.',
      ],
      specifications: {
        'Operation Voltage' : 'DC 9V to 25V',
        'Standby/ Operation Current' : '3mA / <60mA',
        'Operation Temperature': '-20 to +70°C',
        'Bluetooth Protocol' : '3.0 SPP + BLE',
        'Dimensions' : '50*20*26mm',
        'Weight' : '35g'

      },
      downloads: {
        'SwiSys_CAN-Bus-OBDII-Bridge_Flyers-EN_F1902-017':
          '/Downloads/SwiSys_CAN-Bus-OBDII-Bridge_Flyers-EN_F1902-017.pdf'
      },
    },
    'j1939-bridge': {
      title: 'HeavyDuty-J1939 Bridge',
      description:
        'SWISYS Heavy Duty – J1939 Bridge, is a high-level communications protocol, which operates on a Controller Area Network (CAN) bus, which is an In-Vehicle-Infotainment (IVI) cost competitive product. The hardware design is based on our SAE J1939 / OBD-II Device with Bluetooth to get vehicle information such as speed, engine speed, coolant temperature, IAT sensor, APP, MAP, vehicle identification code (VIN), etc. J1939 Bridge contains three parts they are off, CAN Transceiver (TJA1050), main controller (RL78 MCU), and  Bluetooth transmission module (HC-05). J1939 doubles the data transmission rate from 250 Kbit/s to 500 Kbit/s.',
      image: '/j1939-bridge.jpg',
      features: [
  'Provides Basic J1939 Data: SPD, TMP, RPM, APP, Tire, Distance, Weight, Fuel Economics (Instantaneous & Average)',
  'Multiple Command Sets: Basic, Advanced (ESG/FMS), and Customized for system integration',
  'Easy Integration with IoT Devices: BT, USB, 3G/4G, LoRa, NB-IoT; Optional Contactless CAN Probe (CCP)',
  'Automotive-Grade Compliance: BCI (ISO 11452-4), EFT (IEC 61000-4-4), ESD (IEC61000-4-2)',
  'Wide Vehicle Compatibility: Supports 200+ heavy vehicle brands for ESG-based fleet management, ADAS, V2V communication, vehicle diagnosis, and IVI applications',
],
specifications: {
  'Housing Dimensions': '50 x 20 x 21 mm (may vary by connector)',
  'Applications': 'ESG Fleet Management, ADAS, Vehicle Diagnosis & Maintenance, GPS Navigation Assistance, IVI, V2V Communication',
  'Command Set Types': 'Basic, Advanced (E/S/G), Customized',
  'Integration Options': 'BT, USB, 3G/4G, LoRa, NB-IoT, Optional Contactless CAN Probe',
  'Compatible Brands/Models': 'ADL, DAF, DAEWOO, FUSO, HINO, IVECO, KING LONG, SCANIA, VOLVO, YUTONG, etc.',
},

      downloads: {
        'SwiSys_CAN-Bus-J1939-Bridge_Flyers-EN_F2107-014.pdf':
          '/Downloads/SwiSys_CAN-Bus-J1939-Bridge_Flyers-EN_F2107-014.pdf'

      },
    },
    'j1939-recorder': {
      title: 'J1939 Recorder',
      description:
        'The product J1939-DBR has two high performance independent CAN communication channels that can be configured to store either CAN or J1939 data concurrently. The J1939 data can be accessed via actively or passive mode on any parameters specified by customers. This product is beneficial to ADAS (Advanced Driving Assistant System) or FMS (Fleet Management System) product development for heavy duty vehicles. The hardware is also applicable for the IVN(In-Vehicle-Networking) gateway design with firmware design by request.',
      features: [
        'Supports CAN Bus 2.0A, B (ISO 11898-2)',
        'Supports Dual CAN Bus',
        'Supports Record ISO 11898-2 (raw data) *1',
        'Monitor interface: Bluetooth (Ver. 2.0 & 4.0 (Both))',
        'Interface: J1962 port / Contactless CAN Probe *2'

      ],
      specifications: {
        'Input Voltage' : '+12V to +30VDC', 
        'Power Consumption' : '< 5W',
        'Operation Temperature': '0℃ to 70℃',
        'Dimensions': 'H35 x W73 x D125 (mm)',
        'Weight': '400g'
      },
      downloads: {
        'SwiSys_OBDII-J1939-DBR_Flyers-EN_F2104-014':
          '/Downloads/SwiSys_OBDII-J1939-DBR_Flyers-EN_F2104-014.pdf'
      },
    },
    'can-to-uart': {
      title: 'CAN TO UART Converter',
      description:
        'The CAN  to UART converter is a USB-based serial TTL communication device for reading CAN messages. It accesses programmable CAN and UART baud rates. On the PCB board, there are LEDs which display TX and RX signal lines. The standard supports baud rates ranging from 10 KB/s to 1 MB/s. Read all CAN Bus signals, such as CANOpen and J1939. This system is suitable for for connecting PCs and tablets. The CAN to UART converter compatible with the ISO 11898 standard.',
      image: '/can-uart converter.png',
      features: [
        'Supports both CAN 2.0A and CAN 2.0B protocols',
        'Bridges CAN Bus and UART',
        'Embedded with high performance CAN transceiver',
        'Adjustable CAN Bit rates: 100kbps to 1 Mbps',
        'Compliance with the automotive EMS test level: BCI (ISO 11452-4), EFT (IEC 61000-4-4), ESD (IEC 61000-4-2)'
      ],
      specifications: {
        'Power supply' : 'DC 7V ~ 35V',
        'Working Current' : '< 12mA (1mA @Sleep mode)',
        'Bit Rate (CAN)' : '125K, 250K, 500K, 1Mbps',
        'Baud Rate (UART)' : '38400, 57600, 115200,230400, 460800, 921600, 1382400 bps…',
        'Support Protocol CAN' : '2.0A / CAN 2.0B',
        'Dimensions' : '33.0 x 17.8 x 2.7 (mm)',
        'Weight' : '8g',
        'Operation Temperature' : '-25 ~ +75℃'
      },
      downloads: {
        'SwiSys_CAN-UART-Converter_Flyers-EN_F1707-028':
          '/Downloads/SwiSys_CAN-UART-Converter_Flyers-EN_F1707-028.pdf'
      },
    },
    'CCP': {
      title: 'Contactless CAN Probe (CCP)',
      description:
        'Contacless CAN probe device is designed for efficient CAN Bus data monitoring in applications such as transportation and industrial automation. It allows sniffing vehicle CAN bus data without directly connecting to signal wires, making installation safe and non-intrusive. The device features a patented robust encapsulation that protects it against environmental stresses including humidity, dust, temperature fluctuations, electrical interference, and shock. It is easy to install and operate, supports a single CAN Bus channel, and is fully compatible with the ISO 11898 standard (CAN 2.0A/11-bit and CAN 2.0B/29-bit). Additionally, it can be integrated with other systems like CANtoUART, OBDII bridges, and J1939 bridges for extended functionality.',
      features: [
        'Supports CAN Bus data monitoring for transportation and industrial automation.',
        'Non-intrusive vehicle CAN data sniffing without connecting signal wires.',
        'Patented encapsulation protects against humidity, dust, temperature, electricity, and shock.',
        'Easy installation and operation with 1 CAN Bus channel support.',
        'Compatible with ISO 11898 (CAN 2.0A/2.0B) and integrable with CANtoUART, OBDII, and J1939 bridges.'
      ],
      specifications: {
        'Operating Temperature' : '-25 to 85 °C (-13 to 185 °F)',
        'Operating humidity' : '≤ 85 % (no condensation)',
        'Max operating current' : '≤ 8 mA (@28 V)',
        'Operating voltage' : '+9 to +36 VDC',
        'Dimensions' : '40 x 20 x 10 (mm)'
      },
      downloads: {
        'SwiSys_CCP_Flyers-EN_F2408-012A':
          '/Downloads/SwiSys_CCP_Flyers-EN_F2408-012A.pdf',
      },
    },
    'can': {
      title: 'CAN signal generator',
      description:
        'CAN Bus signal generator is originally designed for the automotive industry. It has two pin interface connectors, four adjustable knobs and two toggle switches. The TJA 1050 is the protocol interface for physical bus-to-CAN. The system gives both transmitting and receiving capability for the CAN controller. This standard specifies many different data speeds with 1 MB/s. The latest version of the serial CAN Bus protocol, has increased with the transmission speeds to 10 MB/s. To preserve signal efficiency, the bus requires 120 Ω termination resistance at each end of the unshielded twisted pair cable. CAN Bus signal generator is compatible with standard ISO 11898 and this device is suitable for connecting PCs, smart phones, and tablets.',
      image: '/can signal generator.png',
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
       'Power supply' : 'DC 5V',
       'Working Current' : '< 50mA',
       'Operation Temperature' : '0℃ to 70℃',
       'Dimensions': '123 x 114 x 34 (mm)',
       'Weight' :'221g'
      },
      downloads: {
        'SwiSys_CAN-Emulator_Flyers-EN_F1710-031':
          '/Downloads/SwiSys_CAN-Emulator_Flyers-EN_F1710-031.pdf',
      },
    },
    'j1939': {
      title: 'J1939 signal generator',
      description:
        'J1939 signal generator is a high-level communications protocol, which operates on a Controller Area Network (CAN) Bus. This is useful for the development of the SAE J1939 reader. It can work independently on a PC, without additional software. Eight PGN/SPN data can be manually calibrated for each potentiometer, in two sets. It defines the data priority, size, scaling, and offset. A MIL indicator is provided for displaying the DTC status, which can be triggered by a switch. The standard goes on to define many other aspects, including message timeouts, how large messages are fragmented and reassembled, the network speed, the physical layer, and how applications acquire network addresses. J1939 simulator compliant vehicle signals are suitable for connecting PCs, smart phones, and tablets.',
      image: '/j1939 signal generator.png',
      features: [
        'Compatible with J1939 Standard for heavy duty vehicle',
        'CAN 2.0B 29bit with 250kB Baud',
        'Support J1979 complaints" DMs',
        'Support more than 8 live data',
        'Upgradeable firmware to simulate different PGNs',
        'ECU source address is 0x00'

      ],
      specifications: {
        'Power supply' : '+7VDC ~ +30VDC',
        'Working Current' : '< 100mA',
        'Operation Temperature' : '0℃ to 70℃',
        'Dimensions' : '114 x 33 x 120 (mm)',
        'Connector' : 'J1962 Female',
        'Weight' : '350g'
      },
      downloads: {
        'SwiSys_J1939-Engine-Alternator-Simulator_Flyers-EN_F2003-012':
          '/Downloads/SwiSys_J1939-Engine-Alternator-Simulator_Flyers-EN_F2003-012.pdf',
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

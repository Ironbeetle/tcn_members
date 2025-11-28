import React from 'react';

interface SlidePanelProps {
  title?: string;
}

export const Slide1: React.FC<SlidePanelProps> = ({
  title = "Slide 1: Current State of Substance Abuse in Our Community"
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          {title}
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
      </div>
      {/* Scrollable Content Section with Scroll Snap */}
      <div className="flex-1 overflow-y-scroll overflow-x-hidden hide-scrollbar pr-4 scroll-smooth">
        {/* Content Block 1 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
             
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 mt-2 h-full">                
                <div className="col-span-3 flex flex-col justify-evenly techtxttitle p-1 mb-4 lg:mb-0">
                  <span className="techtxttitley">
                    The Reality We Face
                  </span>
                  Our First Nation community is experiencing an unprecedented influx of illegal drugs and alcohol, 
                  threatening the safety and health of our people.<br/><br/> 
                  This crisis requires immediate and sustained action from leadership, 
                  community members, and external partners.
                </div>
                <div className='col-span-2 flex flex-col justify-center items-center mb-6'>
                  <img
                    src="/slide1panel1.jpg"
                    alt="Substance Abuse Statistics"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 2 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 mt-2 h-full">                
                <div className="col-span-3 flex flex-col justify-center techtxtmbb p-1 mb-4 lg:mb-0">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    How Substances Enter Our Community:
                  </span>
                 External Sources:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-10">
                    <li className='techtxtmb'>Non-community members exploiting relationships with local residents.</li>
                    <li className='techtxtmb'>Unauthorized entry through remote access points.</li>
                    <li className='techtxtmb'>Vehicles entering without proper screening.</li>
                  </ul>
                  Internal Factors:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Community members involved in trafficking networks.</li>
                  </ul>
                </div>
                <div className='col-span-2 flex flex-col justify-center items-center mb-6'>
                  <img
                     src="/slide1panel2.jpg"
                    alt="Substance Abuse Statistics"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 3 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 mt-2 h-full">                
                <div className="col-span-3 flex flex-col justify-center techtxtmbb p-1 mb-12">
                  <span className="techtxttitley mb-12">
                    Who Is Doing This?
                  </span>
                  Outside Influences:
                  <ul className="list-disc list-inside mt-4 mb-12">
                    <li className='techtxtmb'>Drug dealers targeting vulnerable community members.</li>
                    <li className='techtxtmb'>Criminal organizations exploiting remote locations.</li>
                  </ul>
                  Community Member Involvement:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Some residents unknowingly facilitating entry.</li>
                    <li className='techtxtmb'>Others actively participating in distribution networks.</li>
                    <li className='techtxtmb'>Peer pressure and addiction driving participation.</li>
                  </ul>
                </div>
                <div className='col-span-2 flex flex-col justify-center items-center'>
                  <img
                     src="/slide1panel3.jpg"
                    alt="Substance Abuse Statistics"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
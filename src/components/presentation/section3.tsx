import React from 'react';

interface SlidePanelProps {
  title?: string;
}

export const Slide3: React.FC<SlidePanelProps> = ({
  title = "Slide 3: Current Prevention And Enforcement Efforts"
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
        <div 
          className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Immediate Prevention Measures:
                  </span>
                 Community Access Control:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Enhanced monitoring of main entry points.</li>
                    <li className='techtxtmb'>Increased surveillance in high-risk areas.</li>
                    <li className='techtxtmb'>Co-ordination with RCMP.</li>
                  </ul>
                  Technology Solutions:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtsbb'>Deployment of remote trail cameras at key locations.</li>
                    <li className='techtxtsbb'>Drone surveillance with night vision capabilities.</li>
                    <li className='techtxtsbb'>Database of vehicle registrations for monitoring at checkstop.</li>
                  </ul>
                  Community By-Law Enforcement:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtsbb'>Strengthening existing substance abuse by-laws.</li>
                    <li className='techtxtsbb'>Training community members as safety officers.</li>
                    <li className='techtxtsbb'>Establishing reporting mechanisms.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 2 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Intelligence Gathering and Community Involvement:
                  </span>
                 Community Watch Programs:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Teaching residents to identify suspicious activity.</li>
                    <li className='techtxtmb'>Establish a confidential reporting system.</li>
                    <li className='techtxtmb'>Regular community meetings to discuss safety concerns.</li>
                  </ul>
                  Youth Engagement:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Peer education programs.</li>
                    <li className='techtxtmb'>Leadership development initiatives.</li>
                    <li className='techtxtmb'>Cultural activity participation.</li>
                    <li className='techtxtmb'>Mentorship programs.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 3 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center items-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Long-term Prevention Strategies:
                  </span>
                 Education and Awareness:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-10">
                    <li className='techtxtmb'>Cultural education emphasizing traditional values.</li>
                    <li className='techtxtmb'>Life skills and decision-making training.</li>
                    <li className='techtxtmb'>Family education and support programs.</li>
                    <li className='techtxtmb'>Introduce technology-based career opportunities.</li>
                  </ul>
                  Economic Development:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-10">
                    <li className='techtxtmb'>Career training and employment opportunities.</li>
                    <li className='techtxtmb'>Entrepreneurship development programs.</li>
                    <li className='techtxtmb'>Traditional skills development.</li>
                  </ul>
                   Community Infrastructure:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Recreation facilities and programs.</li>
                    <li className='techtxtmb'>Traditional Resource Stewardship Center.</li>
                    <li className='techtxtmb'>Family support services.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
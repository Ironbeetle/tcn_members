import React from 'react';

interface SlidePanelProps {
  title?: string;
}

export const Slide2: React.FC<SlidePanelProps> = ({
  title = "Slide 2: Impact On Our Community Well Being"
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
        <div className="h-auto lg:h-[78vh] mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center mt-2 h-full">                
                <div className="flex flex-col justify-center items-center techtxtmb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Physical Health Consequences:
                  </span>
                 Individual Health:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Increased addiction rates across all age groups.</li>
                    <li className='techtxtmb'>Rising overdose incidents and medical emergencies.</li>
                    <li className='techtxtmb'>Deteriorating mental health and cognitive function.</li>
                    <li className='techtxtmb'>Increased risk of infectious diseases.</li>
                  </ul>
                  Community Health System:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Strain on local healthcare resources and services.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 2 */}
        <div 
          className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-1 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Impact on Children's Development:
                  </span>
                 Mental and Emotional Effects:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Trauma from exposure to substance abuse.</li>
                    <li className='techtxtmb'>Increased anxiety and behavioral problems.</li>
                    <li className='techtxtmb'>Poor academic performance.</li>
                    <li className='techtxtmb'>Loss of cultural identity.</li>
                  </ul>
                  Moral and Social Development:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Normalization of substance use.</li>
                    <li className='techtxtmb'>Weakened community values.</li>
                    <li className='techtxtmb'>Reduced participation in traditional activities.</li>
                    <li className='techtxtmb'>Increased risk of early substance experimentation.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 3 */}
        <div className="h-auto lg:h-[88vh] mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-1 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Family & Home Disruption:
                  </span>
                 Household Stability:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Family breakdown and domestic violence.</li>
                    <li className='techtxtmb'>Child neglect and unsafe home environments.</li>
                    <li className='techtxtmb'>Loss of traditional family structures.</li>
                    <li className='techtxtmb'>Disrupted parenting and caregiving roles.</li>
                  </ul>
                  Inter-generational Impact:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Community members involved in trafficking networks.</li>
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
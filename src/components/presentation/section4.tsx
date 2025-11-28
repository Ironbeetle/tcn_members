import React from 'react';

interface SlidePanelProps {
  title?: string;
}

export const Slide4: React.FC<SlidePanelProps> = ({
  title = "Slide 4: Healing And Recovery Initiatives"
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
      <div className="flex-1 overflow-y-scroll overflow-x-hidden hide-scrollbar scroll-smooth">
        {/* Content Block 1 */}
        <div className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Individual Healing Programs:
                  </span>
                 Existing Prevention Programs:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Addiction counseling services.</li>
                    <li className='techtxtmb'>Medical detoxification support.</li>
                    <li className='techtxtmb'>Ongoing recovery support groups.</li>
                  </ul>
                  Treatment And Support:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Traditional healing.</li>
                    <li className='techtxtmb'>Professional addiction treatment referrals.</li>
                    <li className='techtxtmb'>Family support services.</li>
                    <li className='techtxtmb'>Peer support and mentorship programs.</li>
                  </ul>
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Content Block 2 */}
        <div 
          className="h-auto lg:h-auto mb-6">
          <div className="flex flex-col items-center justify-center w-full h-full p-0 lg:p-0">
            <div className="bg-stone-700/50 rounded-lg p-2 lg:p-6 border border-amber-600/30 h-full w-full lg:w-9/10 overflow-hidden"> 
              <div className="flex flex-col justify-center items-center mt-2 h-full">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Spiritual and Cultural Healing:
                  </span>
                 Traditional Knowledge Programs:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Elders teaching traditional lifestyles.</li>
                    <li className='techtxtmb'>Land stewardship programs.</li>
                    <li className='techtxtmb'>Traditional land use programs.</li>
                  </ul>
                  Multi-Faith Approaches:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Church services.</li>
                    <li className='techtxtmb'>Gospel Jamborees.</li>
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
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    Land-based Healing and Stewardship:
                  </span>
                 Reconnection To The Land:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Traditional land use programs.</li>
                    <li className='techtxtmb'>Environmental stewardship programs.</li>
                    <li className='techtxtmb'>Traditional lifestyles programs.</li>
                  </ul>
                  Healing Through Service:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Community beautification projects.</li>
                    <li className='techtxtmb'>Environmental restoration programs.</li>
                    <li className='techtxtmb'>Cultural activity participation.</li>
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
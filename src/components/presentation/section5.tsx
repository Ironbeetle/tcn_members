import React from 'react';

interface SlidePanelProps {
  title?: string;
}

export const Slide5: React.FC<SlidePanelProps> = ({
  title = "Slide 5: Call To Action And Vision For The Future"
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
              <div className="flex flex-col njustify-center items-center mt-2 h-full p-4">                
                <div className="flex flex-col justify-center techtxtmbb p-1 mb-10">
                  <span className="techtxttitley mb-6 lg:mb-12">
                    A Community Commitment:
                  </span>
                 Unity In Purpose:<br/><br/>
                  Together, we possess the strength, wisdom, and determination to overcome this crisis.
                   Our ancestors faced many challenges and persevered through unity, 
                   traditional knowledge, and unwavering commitment to future generations.
                   <div className='mt-6 lg:mt-12'>
                    Actions Required:
                    <ul className="list-disc list-inside mt-4">
                      <li className='techtxtmb'>Community-wide participation in prevention efforts.</li>
                      <li className='techtxtmb'>...</li>
                      <li className='techtxtmb'>...</li>
                      <li className='techtxtmb'>...</li>
                    </ul>
                  </div>
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
                    Building a Healthy, Prosperous Community:
                  </span>
                 Short Term Goals:
                  <ul className="list-disc list-inside mt-4 mb-6 lg:mb-12">
                    <li className='techtxtmb'>Enhance security measures.</li>
                    <li className='techtxtmb'>Launch community education campaigns.</li>
                    <li className='techtxtmb'>Create youth engagement initiatives.</li>
                  </ul>
                  Long Term Goals:
                  <ul className="list-disc list-inside mt-4">
                    <li className='techtxtmb'>Develop sustainable economic opportunities.</li>
                    <li className='techtxtmb'>Build on existing treatment and recovery infrastructure.</li>
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
                  <span className="techtxttitley mb-6 lg:mb-6">
                    Final Words:
                  </span>
                  Our Promise to Future Generations:<br/><br/>
                  By working together leadership, community members, elders, youth, and families we can get rid the of drugs and alcohol 
                  that poisons our community.<br/> 
                  We will create a safe, healthy, and prosperous environment where our children and future generations can thrive. 
                  <span className="techtxtmbb mb-6 lg:mb-6 mt-6 lg:mt-12">
                    The Path Forward:
                  </span>
                  This is not just a fight against substances; it is a fight for our community, our children's future, and our cultural survival. 
                  <br/>With determination, unity, and the wisdom of our ancestors guiding us, we will succeed.
                </div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
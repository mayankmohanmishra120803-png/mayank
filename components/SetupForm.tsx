
import React, { useState, useMemo } from 'react';
import { TestConfig } from '../types';

interface SetupFormProps {
  onStart: (config: TestConfig, studentName: string) => void;
  onSwitchToOwner: () => void;
}

// Structured Curriculum Data expanded with JEE and NEET
const CURRICULUM_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  'CBSE Board': {
    'Class 10': {
      'Mathematics': ['Real Numbers', 'Polynomials', 'Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
      'Science': ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity and Evolution', 'Light - Reflection and Refraction', 'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Our Environment'],
      'Social Science': ['Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World', 'The Age of Industrialization', 'Resources and Development', 'Forest and Wildlife Resources', 'Water Resources', 'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries', 'Lifelines of National Economy', 'Power Sharing', 'Federalism', 'Gender, Religion and Caste', 'Political Parties', 'Outcomes of Democracy', 'Development', 'Sectors of the Indian Economy', 'Money and Credit', 'Globalisation and the Indian Economy']
    },
    'Class 9': {
      'Mathematics': ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Introduction to Euclid Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron’s Formula', 'Surface Areas and Volumes', 'Statistics'],
      'Science': ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound', 'Improvement in Food Resources'],
      'Social Science': ['The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler', 'Forest Society and Colonialism', 'Pastoralists in the Modern World', 'What is Democracy? Why Democracy?', 'Constitutional Design', 'Electoral Politics', 'Working of Institutions', 'Democratic Rights', 'India - Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife', 'Population', 'The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge', 'Food Security in India']
    },
    'Class 8': {
      'Mathematics': ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Practical Geometry', 'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots', 'Comparing Quantities', 'Algebraic Expressions and Identities', 'Visualising Solid Shapes', 'Mensuration', 'Exponents and Powers', 'Direct and Inverse Proportions', 'Factorisation', 'Introduction to Graphs', 'Playing with Numbers'],
      'Science': ['Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics', 'Materials: Metals and Non-Metals', 'Coal and Petroleum', 'Combustion and Flame', 'Conservation of Plants and Animals', 'Cell - Structure and Functions', 'Reproduction in Animals', 'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction', 'Sound', 'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light', 'Stars and The Solar System', 'Pollution of Air and Water']
    },
    'Class 7': {
      'Mathematics': ['Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations', 'Lines and Angles', 'The Triangle and its Properties', 'Congruence of Triangles', 'Comparing Quantities', 'Rational Numbers', 'Practical Geometry', 'Perimeter and Area', 'Algebraic Expressions', 'Exponents and Powers', 'Symmetry', 'Visualising Solid Shapes'],
      'Science': ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Weather, Climate and Adaptations of Animals to Climate', 'Winds, Storms and Cyclones', 'Soil', 'Respiration in Organisms', 'Transportation in Animals and Plants', 'Reproduction in Plants', 'Motion and Time', 'Electric Current and its Effects', 'Light', 'Water: A Precious Resource', 'Forests: Our Lifeline', 'Wastewater Story']
    },
    'Class 6': {
      'Mathematics': ['Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas', 'Understanding Elementary Shapes', 'Integers', 'Fractions', 'Decimals', 'Data Handling', 'Mensuration', 'Algebra', 'Ratio and Proportion', 'Symmetry', 'Practical Geometry'],
      'Science': ['Food: Where Does It Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials into Groups', 'Separation of Substances', 'Changes Around Us', 'Getting to Know Plants', 'Body Movements', 'The Living Organisms and Their Surroundings', 'Motion and Measurement of Distances', 'Light, Shadows and Reflections', 'Electricity and Circuits', 'Fun with Magnets', 'Water', 'Air Around Us', 'Garbage In, Garbage Out']
    }
  },
  'ICSE Board': {
    'Class 10': {
      'Mathematics': ['GST', 'Banking', 'Linear Inequations', 'Quadratic Equations', 'Ratio and Proportion', 'Remainder and Factor Theorems', 'Matrices', 'Arithmetic Progression', 'Geometric Progression', 'Coordinate Geometry', 'Similarity', 'Circles', 'Mensuration', 'Trigonometry', 'Statistics', 'Probability'],
      'Science (Physics)': ['Force', 'Work, Energy and Power', 'Light', 'Sound', 'Current Electricity', 'Household Circuits', 'Electromagnetism', 'Calorimetry', 'Radioactivity'],
      'Science (Chemistry)': ['Periodic Properties', 'Chemical Bonding', 'Study of Acids, Bases and Salts', 'Analytical Chemistry', 'Mole Concept', 'Electrolysis', 'Metallurgy', 'Study of Compounds', 'Organic Chemistry'],
      'Science (Biology)': ['Cell Cycle and Cell Division', 'Genetics', 'Absorption by Roots', 'Transpiration', 'Photosynthesis', 'Chemical Coordination in Plants', 'The Circulatory System', 'The Excretory System', 'The Nervous System', 'The Endocrine System', 'The Reproductive System', 'Population', 'Pollution']
    },
    'Class 9': {
      'Mathematics': ['Rational and Irrational Numbers', 'Compound Interest', 'Expansions', 'Factorisation', 'Simultaneous Linear Equations', 'Indices', 'Logarithms', 'Triangles', 'Pythagoras Theorem', 'Rectilinear Figures', 'Theorems on Area', 'Circle', 'Statistics', 'Mensuration', 'Trigonometry'],
      'Science (Physics)': ['Measurements and Experimentation', 'Motion in One Dimension', 'Laws of Motion', 'Fluids', 'Heat and Energy', 'Light', 'Sound', 'Electricity and Magnetism']
    }
  },
  'JEE Preparation': {
    'JEE Mains': {
      'Physics': ['Units and Measurements', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Gravitation', 'Properties of Solids and Liquids', 'Thermodynamics', 'Kinetic Theory of Gases', 'Oscillations and Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei', 'Electronic Devices', 'Communication Systems'],
      'Chemistry': ['Some Basic Concepts in Chemistry', 'States of Matter', 'Atomic Structure', 'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Solutions', 'Equilibrium', 'Redox Reactions and Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Classification of Elements and Periodicity in Properties', 'General Principles and Processes of Isolation of Metals', 'Hydrogen', 's-Block Elements', 'p-Block Elements', 'd- and f-Block Elements', 'Coordination Compounds', 'Environmental Chemistry', 'Purification and Characterisation of Organic Compounds', 'Some Basic Principles of Organic Chemistry', 'Hydrocarbons', 'Organic Compounds Containing Halogens', 'Organic Compounds Containing Oxygen', 'Organic Compounds Containing Nitrogen', 'Polymers', 'Biomolecules', 'Chemistry in Everyday Life'],
      'Mathematics': ['Sets, Relations and Functions', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants', 'Permutations and Combinations', 'Mathematical Induction', 'Binomial Theorem and its Simple Applications', 'Sequences and Series', 'Limit, Continuity and Differentiability', 'Integral Calculus', 'Differential Equations', 'Coordinate Geometry', 'Three Dimensional Geometry', 'Vector Algebra', 'Statistics and Probability', 'Trigonometry', 'Mathematical Reasoning']
    },
    'JEE Advanced': {
      'Physics': ['General Physics', 'Mechanics', 'Thermal Physics', 'Electricity and Magnetism', 'Optics', 'Modern Physics'],
      'Chemistry': ['General Topics', 'Gaseous and Liquid States', 'Atomic Structure and Chemical Bonding', 'Energetics', 'Chemical Equilibrium', 'Electrochemistry', 'Chemical Kinetics', 'Solid State', 'Solutions', 'Surface Chemistry', 'Classification of Elements and Periodicity', 'General Principles of Isolation of Metals', 'Non-metals', 'Compounds of s-block elements', 'Compounds of p-block elements', 'Compounds of d-block elements', 'Coordination Compounds', 'Nuclear Chemistry', 'Organic Chemistry Basics', 'Hydrocarbons', 'Phenols', 'Alcohols and Ethers', 'Aldehydes and Ketones', 'Carboxylic Acids', 'Haloalkanes and Haloarenes', 'Amines', 'Amino Acids and Peptides', 'Polymers', 'Practical Organic Chemistry'],
      'Mathematics': ['Algebra', 'Trigonometry', 'Analytical Geometry', 'Differential Calculus', 'Integral Calculus', 'Vectors']
    }
  },
  'NEET Preparation': {
    'NEET UG': {
      'Physics': ['Physical World and Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Motion of System of Particles and Rigid Body', 'Gravitation', 'Properties of Bulk Matter', 'Thermodynamics', 'Behaviour of Perfect Gas and Kinetic Theory', 'Oscillations and Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei', 'Electronic Devices'],
      'Chemistry': ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 'Chemical Bonding and Molecular Structure', 'States of Matter: Gases and Liquids', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 's-Block Element', 'Some p-Block Elements', 'Organic Chemistry- Some Basic Principles and Techniques', 'Hydrocarbons', 'Environmental Chemistry', 'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles and Processes of Isolation of Elements', 'p-Block Elements', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Organic Compounds Containing Nitrogen', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
      'Biology': ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis in Higher Plants', 'Respiration in Plants', 'Plant Growth and Development', 'Digestion and Absorption', 'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and Their Elimination', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration', 'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues']
    }
  }
};

const SetupForm: React.FC<SetupFormProps> = ({ onStart, onSwitchToOwner }) => {
  const [studentName, setStudentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState<TestConfig>({
    className: 'Class 10',
    subject: 'Mathematics',
    chapters: [],
    questionCount: 10,
    difficulty: 'Medium',
    competition: 'CBSE Board'
  });

  const boards = Object.keys(CURRICULUM_DATA);

  const availableClasses = useMemo(() => {
    return Object.keys(CURRICULUM_DATA[config.competition] || {});
  }, [config.competition]);

  const availableSubjects = useMemo(() => {
    return Object.keys(CURRICULUM_DATA[config.competition]?.[config.className] || {});
  }, [config.competition, config.className]);

  const availableChapters = useMemo(() => {
    return CURRICULUM_DATA[config.competition]?.[config.className]?.[config.subject] || [];
  }, [config.competition, config.className, config.subject]);

  const filteredChapters = useMemo(() => {
    return availableChapters.filter(c => 
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableChapters, searchTerm]);

  const toggleChapter = (chapter: string) => {
    setConfig(prev => {
      const isSelected = prev.chapters.includes(chapter);
      if (isSelected) {
        return { ...prev, chapters: prev.chapters.filter(c => c !== chapter) };
      } else {
        return { ...prev, chapters: [...prev.chapters, chapter] };
      }
    });
  };

  const toggleAll = () => {
    if (config.chapters.length === availableChapters.length) {
      setConfig({ ...config, chapters: [] });
    } else {
      setConfig({ ...config, chapters: [...availableChapters] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim() && config.chapters.length > 0) {
      onStart(config, studentName);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.1)] border border-slate-100">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Arena Config</h2>
            <p className="text-indigo-500 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Prepare for excellence</p>
          </div>
          <button 
            onClick={onSwitchToOwner}
            className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-2xl hover:bg-indigo-100 transition-all uppercase"
          >
            Vault Access
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Target Arena (Boards/Exams) */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Target Arena</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {boards.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    const classes = Object.keys(CURRICULUM_DATA[b]);
                    const firstClass = classes[0];
                    const subjects = Object.keys(CURRICULUM_DATA[b][firstClass]);
                    const firstSubject = subjects[0];
                    setConfig({...config, competition: b, className: firstClass, subject: firstSubject, chapters: []});
                  }}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${config.competition === b ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                >
                  {b.replace(' Preparation', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Exam / Grade Level</label>
              <select 
                className="w-full px-7 py-5 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all appearance-none font-bold text-lg"
                value={config.className}
                onChange={(e) => {
                  const newClass = e.target.value;
                  const subjects = Object.keys(CURRICULUM_DATA[config.competition][newClass]);
                  setConfig({...config, className: newClass, subject: subjects[0], chapters: []});
                }}
              >
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Subject Mastery</label>
              <select 
                className="w-full px-7 py-5 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all appearance-none font-bold text-lg"
                value={config.subject}
                onChange={(e) => {
                  setConfig({...config, subject: e.target.value, chapters: []});
                  setSearchTerm('');
                }}
              >
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Candidate Identity</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-7 py-5 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-lg"
              placeholder="Full Name"
            />
          </div>

          {/* Chapter Selection UI */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Targeted Chapters <span className="text-indigo-600">({config.chapters.length})</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                {config.chapters.length === availableChapters.length ? 'Clear All' : 'Select All'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text"
                placeholder={`Search chapters in ${config.subject}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold shadow-inner"
              />
            </div>

            <div className="bg-slate-50 rounded-[3rem] border-2 border-slate-50 p-2 overflow-hidden shadow-inner">
               {config.chapters.length > 0 && (
                  <div className="p-6 border-b border-slate-200/50">
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {config.chapters.map(c => (
                        <span key={c} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-200 animate-in zoom-in duration-300">
                          {c}
                          <button type="button" onClick={() => toggleChapter(c)} className="hover:text-indigo-200"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                        </span>
                      ))}
                    </div>
                  </div>
               )}

               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {filteredChapters.map(chapter => {
                    const isSelected = config.chapters.includes(chapter);
                    return (
                      <button
                        key={chapter}
                        type="button"
                        onClick={() => toggleChapter(chapter)}
                        className={`flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all ${isSelected ? 'bg-white border-indigo-100 border-2 shadow-xl scale-[1.02]' : 'hover:bg-white/50 text-slate-500'}`}
                      >
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>{chapter}</span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white rotate-45'}`}>
                          {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                        </div>
                      </button>
                    )
                  })}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Difficulty Curve</label>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-50">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfig({...config, difficulty: d as any})}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${config.difficulty === d ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Question Volley</label>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-50">
                {[10, 20, 30, 50].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setConfig({...config, questionCount: n})}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all ${config.questionCount === n ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={config.chapters.length === 0}
            className={`w-full text-white font-black py-6 rounded-[2.5rem] transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 text-lg ${config.chapters.length > 0 ? 'bg-indigo-600' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            {config.chapters.length === 0 ? 'Equip Chapters' : 'Release Arrow (Start)'}
          </button>
        </form>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          </div>
          <h3 className="text-2xl font-black mb-8 relative z-10">Aimer’s Logic</h3>
          <div className="space-y-8 relative z-10">
             <div className="flex gap-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-black text-sm">🎯</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1.5">Zero Variance</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-bold">Chapters are fixed to your Board's curriculum. No random noise.</p>
                </div>
             </div>
             <div className="flex gap-5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                  <span className="text-white font-black text-sm">🔄</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1.5">Infinite Loops</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-bold">Errors loop back until corrected. We don't settle for "near hits".</p>
                </div>
             </div>
             <div className="flex gap-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <span className="text-white font-black text-sm">📈</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1.5">JEE / NEET Heatmaps</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-bold">We track sub-topics in competitive exams for granular analysis.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Prep Arenas</h4>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border-2 border-indigo-50">
                 <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">JEE Preparation</span>
                 <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-rose-50/50 rounded-2xl border-2 border-rose-50">
                 <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest">NEET Preparation</span>
                 <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-slate-50">
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">CBSE (6-10)</span>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase">Live</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;

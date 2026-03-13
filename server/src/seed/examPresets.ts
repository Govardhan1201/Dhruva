// Comprehensive exam preset syllabi for seeding
export const examPresets = [
    // ─── CA FOUNDATION ──────────────────────────────────────────────────────────
    {
        name: 'CA Foundation',
        slug: 'ca-foundation',
        category: 'CA',
        description: 'ICAI CA Foundation – entry level exam covering Accounts, Laws, Maths & Economics',
        subjects: [
            {
                name: 'Principles and Practice of Accounting',
                color: '#6366f1',
                units: [
                    {
                        name: 'Theoretical Framework',
                        chapters: [
                            { name: 'Meaning and Scope of Accounting' },
                            { name: 'Accounting Concepts, Principles and Conventions' },
                            { name: 'Capital and Revenue Expenditures' },
                            { name: 'Contingent Assets and Liabilities' },
                        ],
                    },
                    {
                        name: 'Accounting Process',
                        chapters: [
                            { name: 'Books of Accounts' },
                            { name: 'Preparation of Trial Balance' },
                            { name: 'Rectification of Errors' },
                        ],
                    },
                    {
                        name: 'Bank Reconciliation Statement',
                        chapters: [{ name: 'Bank Reconciliation Statement' }],
                    },
                    {
                        name: 'Inventories',
                        chapters: [
                            { name: 'Basis of Stock Valuation' },
                            { name: 'Methods of Stock Valuation – FIFO, LIFO, Weighted Average' },
                        ],
                    },
                    {
                        name: 'Depreciation',
                        chapters: [
                            { name: 'Meaning and Methods of Depreciation' },
                            { name: 'SLM vs WDV' },
                        ],
                    },
                    {
                        name: 'Bills of Exchange',
                        chapters: [{ name: 'Bills of Exchange and Promissory Notes' }],
                    },
                    {
                        name: 'Final Accounts',
                        chapters: [
                            { name: 'Trading, Profit & Loss Account' },
                            { name: 'Balance Sheet' },
                            { name: 'Adjustments in Final Accounts' },
                        ],
                    },
                    {
                        name: 'Partnership',
                        chapters: [
                            { name: 'Partnership Fundamentals' },
                            { name: 'Admission of a Partner' },
                            { name: 'Retirement and Death of Partner' },
                            { name: 'Dissolution of Partnership' },
                        ],
                    },
                    {
                        name: 'Company Accounts',
                        chapters: [
                            { name: 'Issue of Shares' },
                            { name: 'Forfeiture and Reissue of Shares' },
                            { name: 'Issue of Debentures' },
                        ],
                    },
                ],
            },
            {
                name: 'Business Laws',
                color: '#f59e0b',
                units: [
                    {
                        name: 'Indian Contract Act 1872',
                        chapters: [
                            { name: 'Nature of Contracts' },
                            { name: 'Offer and Acceptance' },
                            { name: 'Capacity of Parties' },
                            { name: 'Consideration' },
                            { name: 'Free Consent' },
                            { name: 'Legality of Object' },
                            { name: 'Performance of Contract' },
                            { name: 'Breach and Remedies' },
                        ],
                    },
                    {
                        name: 'Sale of Goods Act',
                        chapters: [
                            { name: 'Formation of Contract of Sale' },
                            { name: 'Conditions and Warranties' },
                            { name: 'Transfer of Property' },
                            { name: 'Unpaid Seller' },
                        ],
                    },
                    {
                        name: 'Indian Partnership Act',
                        chapters: [
                            { name: 'Nature of Partnership' },
                            { name: 'Registration of Firms' },
                        ],
                    },
                    {
                        name: 'LLP Act 2008',
                        chapters: [{ name: 'Introduction to LLP' }],
                    },
                    {
                        name: 'Companies Act 2013 (Basics)',
                        chapters: [
                            { name: 'Types of Companies' },
                            { name: 'Incorporation' },
                        ],
                    },
                ],
            },
            {
                name: 'Quantitative Aptitude',
                color: '#10b981',
                units: [
                    {
                        name: 'Ratio, Proportion & Indices',
                        chapters: [
                            { name: 'Ratio and Proportion' },
                            { name: 'Indices and Logarithms' },
                        ],
                    },
                    {
                        name: 'Equations',
                        chapters: [
                            { name: 'Linear Simultaneous Equations' },
                            { name: 'Quadratic and Cubic Equations' },
                        ],
                    },
                    {
                        name: 'Arithmetic & Geometric Progressions',
                        chapters: [
                            { name: 'AP and GP' },
                            { name: 'Sum of Series' },
                        ],
                    },
                    {
                        name: 'Set Theory',
                        chapters: [{ name: 'Sets, Functions, Relations' }],
                    },
                    {
                        name: 'Limits and Continuity',
                        chapters: [{ name: 'Limits' }, { name: 'Continuity' }],
                    },
                    {
                        name: 'Differential Calculus',
                        chapters: [{ name: 'Differentiation' }, { name: 'Applications of Derivatives' }],
                    },
                    {
                        name: 'Integral Calculus',
                        chapters: [{ name: 'Integration and its Applications' }],
                    },
                    {
                        name: 'Statistics',
                        chapters: [
                            { name: 'Statistical Description of Data' },
                            { name: 'Measures of Central Tendency' },
                            { name: 'Measures of Dispersion' },
                            { name: 'Correlation and Regression' },
                            { name: 'Probability' },
                            { name: 'Theoretical Distributions' },
                        ],
                    },
                ],
            },
            {
                name: 'Business Economics & Business and Commercial Knowledge',
                color: '#ec4899',
                units: [
                    {
                        name: 'Business Economics',
                        chapters: [
                            { name: 'Introduction to Business Economics' },
                            { name: 'Theory of Demand and Supply' },
                            { name: 'Theory of Production' },
                            { name: 'Cost Analysis' },
                            { name: 'Market Structures' },
                            { name: 'Business Cycles' },
                            { name: 'Determination of National Income' },
                            { name: 'Money Market' },
                            { name: 'International Trade' },
                        ],
                    },
                    {
                        name: 'Business and Commercial Knowledge',
                        chapters: [
                            { name: 'Business Organisations' },
                            { name: 'Government Policies' },
                            { name: 'Business Finance Basics' },
                            { name: 'Business Communication' },
                        ],
                    },
                ],
            },
        ],
    },

    // ─── CA INTER ────────────────────────────────────────────────────────────────
    {
        name: 'CA Intermediate',
        slug: 'ca-inter',
        category: 'CA',
        description: 'ICAI CA Intermediate – Group I & II covering advanced accounting, law, cost, tax, audit, FM, IT',
        subjects: [
            {
                name: 'Advanced Accounting',
                color: '#6366f1',
                units: [
                    { name: 'AS & Ind AS', chapters: [{ name: 'AS 1-29 Overview' }, { name: 'Ind AS Framework' }] },
                    { name: 'Company Accounts', chapters: [{ name: 'Issue of Shares and Debentures' }, { name: 'Redemption of Debentures' }, { name: 'Profit Prior to Incorporation' }] },
                    { name: 'Amalgamation', chapters: [{ name: 'Amalgamation (AS 14)' }, { name: 'Internal Reconstruction' }] },
                    { name: 'Branch Accounting', chapters: [{ name: 'Dependent and Independent Branches' }] },
                    { name: 'Insurance Claims', chapters: [{ name: 'Loss of Stock and Profit' }] },
                    { name: 'Hire Purchase', chapters: [{ name: 'Hire Purchase and Installment Sale' }] },
                ],
            },
            {
                name: 'Corporate and Other Laws',
                color: '#f59e0b',
                units: [
                    { name: 'Companies Act 2013', chapters: [{ name: 'Incorporation' }, { name: 'Board and Meetings' }, { name: 'Dividend' }, { name: 'Accounts and Audit' }, { name: 'Charges' }] },
                    { name: 'Other Economic Laws', chapters: [{ name: 'FEMA Basics' }, { name: 'SEBI Regulations' }, { name: 'RTI Act' }] },
                ],
            },
            {
                name: 'Cost and Management Accounting',
                color: '#10b981',
                units: [
                    { name: 'Basics', chapters: [{ name: 'Introduction to Cost Accounting' }, { name: 'Element of Cost' }] },
                    { name: 'Costing Methods', chapters: [{ name: 'Job Costing' }, { name: 'Process Costing' }, { name: 'Contract Costing' }, { name: 'Service Costing' }] },
                    { name: 'Standard Costing', chapters: [{ name: 'Standard Costing and Variance Analysis' }] },
                    { name: 'Budget & Control', chapters: [{ name: 'Budgets and Budgetary Control' }] },
                    { name: 'Marginal Costing', chapters: [{ name: 'Marginal Costing and CVP Analysis' }] },
                ],
            },
            {
                name: 'Taxation',
                color: '#ec4899',
                units: [
                    { name: 'Income Tax', chapters: [{ name: 'Basic Concepts' }, { name: 'Residential Status' }, { name: 'Income from Salary' }, { name: 'Income from House Property' }, { name: 'PGBP' }, { name: 'Capital Gains' }, { name: 'Other Sources' }, { name: 'Clubbing & Set-off' }, { name: 'Deductions' }, { name: 'TDS & Advance Tax' }] },
                    { name: 'GST', chapters: [{ name: 'GST Basic Concepts' }, { name: 'Supply under GST' }, { name: 'ITC' }, { name: 'Registration' }, { name: 'Returns' }] },
                ],
            },
            {
                name: 'Auditing and Assurance',
                color: '#8b5cf6',
                units: [
                    { name: 'Basics', chapters: [{ name: 'Nature and Audit' }, { name: 'Audit Strategy and Plan' }] },
                    { name: 'Audit Evidence & Procedures', chapters: [{ name: 'Audit Sampling' }, { name: 'Substantive Procedures' }] },
                    { name: 'Company Audit', chapters: [{ name: 'Audit of Companies' }, { name: 'Audit Report' }] },
                ],
            },
            {
                name: 'Financial Management',
                color: '#f97316',
                units: [
                    { name: 'Basics', chapters: [{ name: 'FM Overview' }, { name: 'Time Value of Money' }] },
                    { name: 'Capital Budgeting', chapters: [{ name: 'NPV, IRR, Payback' }] },
                    { name: 'Working Capital', chapters: [{ name: 'Working Capital Management' }] },
                    { name: 'Financing', chapters: [{ name: 'Sources of Finance' }, { name: 'Cost of Capital' }, { name: 'Capital Structure' }, { name: 'Dividend Policy' }] },
                ],
            },
        ],
    },

    // ─── CA FINAL ────────────────────────────────────────────────────────────────
    {
        name: 'CA Final',
        slug: 'ca-final',
        category: 'CA',
        description: 'ICAI CA Final – the culminating CA exam with FR, SFM, Audit, Law, Tax, SCMPE, EIS',
        subjects: [
            {
                name: 'Financial Reporting',
                color: '#6366f1',
                units: [
                    { name: 'Ind AS', chapters: [{ name: 'Ind AS 1-41 Comprehensive' }, { name: 'IFRS vs Ind AS' }] },
                    { name: 'Consolidated Financials', chapters: [{ name: 'Consolidated Financial Statements' }] },
                    { name: 'Business Combinations', chapters: [{ name: 'Mergers and Acquisitions Reporting' }] },
                ],
            },
            {
                name: 'Strategic Financial Management',
                color: '#f59e0b',
                units: [
                    { name: 'Risk Management', chapters: [{ name: 'Financial Risk Management' }, { name: 'Derivatives' }] },
                    { name: 'Portfolio', chapters: [{ name: 'Portfolio Theory' }, { name: 'CAPM' }] },
                    { name: 'Valuation', chapters: [{ name: 'Business Valuation' }] },
                    { name: 'M&A', chapters: [{ name: 'Mergers Acquisitions and Restructuring' }] },
                    { name: 'International Finance', chapters: [{ name: 'Forex and Currency Risk' }] },
                ],
            },
            {
                name: 'Advanced Auditing',
                color: '#10b981',
                units: [
                    { name: 'SA Framework', chapters: [{ name: 'Standards on Auditing' }] },
                    { name: 'Special Audits', chapters: [{ name: 'Bank Audit' }, { name: 'IT Audit' }] },
                    { name: 'Fraud', chapters: [{ name: 'Fraud Detection and Reporting' }] },
                ],
            },
            {
                name: 'Corporate and Economic Laws',
                color: '#ec4899',
                units: [
                    { name: 'Companies Act Advanced', chapters: [{ name: 'NCLT & Tribunals' }, { name: 'Winding Up' }] },
                    { name: 'SEBI & Securities Laws', chapters: [{ name: 'SEBI Regulations Advanced' }] },
                    { name: 'Competition Law', chapters: [{ name: 'Competition Act' }] },
                ],
            },
            {
                name: 'Direct Tax and International Taxation',
                color: '#8b5cf6',
                units: [
                    { name: 'Advanced Tax', chapters: [{ name: 'Business Trust Taxation' }, { name: 'Alternate Minimum Tax' }] },
                    { name: 'International Tax', chapters: [{ name: 'DTAA' }, { name: 'Transfer Pricing' }, { name: 'BEPS' }] },
                ],
            },
            {
                name: 'Indirect Tax Laws',
                color: '#f97316',
                units: [
                    { name: 'Advanced GST', chapters: [{ name: 'GST Audit' }, { name: 'Anti-Profiteering' }, { name: 'E-Way Bill' }] },
                    { name: 'Customs', chapters: [{ name: 'Customs Duty' }, { name: 'SEZ and Export Incentives' }] },
                ],
            },
            {
                name: 'SCMPE',
                color: '#14b8a6',
                units: [
                    { name: 'Strategic Cost Mgmt', chapters: [{ name: 'CVP and Pricing Decisions' }, { name: 'Activity Based Costing' }] },
                    { name: 'Performance Evaluation', chapters: [{ name: 'Responsibility Centres' }, { name: 'Balanced Scorecard' }] },
                ],
            },
        ],
    },

    // ─── JEE MAINS ───────────────────────────────────────────────────────────────
    {
        name: 'JEE Mains',
        slug: 'jee-mains',
        category: 'JEE',
        description: 'NTA JEE Mains – Physics, Chemistry and Maths for engineering admission',
        subjects: [
            {
                name: 'Physics',
                color: '#3b82f6',
                units: [
                    { name: 'Mechanics', chapters: [{ name: 'Units and Measurement' }, { name: 'Kinematics' }, { name: 'Laws of Motion' }, { name: 'Work, Energy and Power' }, { name: 'Systems of Particles' }, { name: 'Rotational Motion' }, { name: 'Gravitation' }] },
                    { name: 'Thermodynamics', chapters: [{ name: 'Thermal Properties of Matter' }, { name: 'Thermodynamics Laws' }, { name: 'Kinetic Theory of Gases' }] },
                    { name: 'Oscillations & Waves', chapters: [{ name: 'Simple Harmonic Motion' }, { name: 'Waves and Sound' }] },
                    { name: 'Electrostatics', chapters: [{ name: 'Electric Charges and Fields' }, { name: 'Electrostatic Potential' }, { name: 'Capacitance' }] },
                    { name: 'Current Electricity', chapters: [{ name: 'Current Electricity' }, { name: 'Moving Charges and Magnetism' }, { name: 'Magnetism and Matter' }] },
                    { name: 'EMI & AC', chapters: [{ name: 'Electromagnetic Induction' }, { name: 'Alternating Current' }] },
                    { name: 'Optics', chapters: [{ name: 'Ray Optics' }, { name: 'Wave Optics' }] },
                    { name: 'Modern Physics', chapters: [{ name: 'Dual Nature of Radiation' }, { name: 'Atoms' }, { name: 'Nuclei' }, { name: 'Semiconductor Devices' }] },
                ],
            },
            {
                name: 'Chemistry',
                color: '#22c55e',
                units: [
                    { name: 'Physical Chemistry', chapters: [{ name: 'Some Basic Concepts' }, { name: 'Atomic Structure' }, { name: 'Chemical Bonding' }, { name: 'States of Matter' }, { name: 'Thermodynamics' }, { name: 'Equilibrium' }, { name: 'Redox Reactions' }, { name: 'Electrochemistry' }, { name: 'Chemical Kinetics' }, { name: 'Surface Chemistry' }] },
                    { name: 'Inorganic Chemistry', chapters: [{ name: 'Periodic Table' }, { name: 'p-Block Elements' }, { name: 'd & f Block Elements' }, { name: 'Coordination Compounds' }] },
                    { name: 'Organic Chemistry', chapters: [{ name: 'Basic Principles of Organic Chemistry' }, { name: 'Hydrocarbons' }, { name: 'Haloalkanes & Haloarenes' }, { name: 'Alcohols, Phenols and Ethers' }, { name: 'Aldehydes and Ketones' }, { name: 'Carboxylic Acids' }, { name: 'Amines' }, { name: 'Biomolecules' }, { name: 'Polymers' }] },
                ],
            },
            {
                name: 'Mathematics',
                color: '#f97316',
                units: [
                    { name: 'Algebra', chapters: [{ name: 'Complex Numbers' }, { name: 'Quadratic Equations' }, { name: 'Sequences and Series' }, { name: 'Permutations and Combinations' }, { name: 'Binomial Theorem' }, { name: 'Matrices and Determinants' }] },
                    { name: 'Coordinate Geometry', chapters: [{ name: 'Straight Lines' }, { name: 'Circles' }, { name: 'Parabola' }, { name: 'Ellipse' }, { name: 'Hyperbola' }] },
                    { name: 'Calculus', chapters: [{ name: 'Limits and Continuity' }, { name: 'Differentiation' }, { name: 'Applications of Derivatives' }, { name: 'Indefinite Integration' }, { name: 'Definite Integration' }, { name: 'Area Under Curves' }, { name: 'Differential Equations' }] },
                    { name: 'Vectors & 3D', chapters: [{ name: 'Vector Algebra' }, { name: '3D Geometry' }] },
                    { name: 'Probability & Statistics', chapters: [{ name: 'Probability' }, { name: 'Statistics' }] },
                    { name: 'Trigonometry', chapters: [{ name: 'Trigonometric Functions' }, { name: 'Inverse Trigonometry' }] },
                ],
            },
        ],
    },

    // ─── JEE ADVANCED ─────────────────────────────────────────────────────────────
    {
        name: 'JEE Advanced',
        slug: 'jee-advanced',
        category: 'JEE',
        description: 'IIT JEE Advanced – high difficulty Physics, Chemistry, Maths for IIT admissions',
        subjects: [
            {
                name: 'Physics',
                color: '#3b82f6',
                units: [
                    { name: 'Mechanics (Advanced)', chapters: [{ name: 'Rigid Body Dynamics' }, { name: 'Fluid Mechanics' }, { name: 'Elasticity' }] },
                    { name: 'Electrodynamics', chapters: [{ name: 'Advanced Electrostatics' }, { name: 'Circuits (Advanced)' }, { name: 'Electromagnetic Waves' }] },
                    { name: 'Modern Physics', chapters: [{ name: 'Photoelectric Effect' }, { name: 'Nuclear Physics' }, { name: 'X-rays' }] },
                    { name: 'Optics', chapters: [{ name: 'Interference' }, { name: 'Diffraction' }, { name: 'Polarisation' }] },
                ],
            },
            {
                name: 'Chemistry',
                color: '#22c55e',
                units: [
                    { name: 'Phys Chem (Advanced)', chapters: [{ name: 'Solid State' }, { name: 'Solutions' }, { name: 'Electrochemistry Advanced' }] },
                    { name: 'Org Chem (Advanced)', chapters: [{ name: 'Named Reactions' }, { name: 'Stereochemistry' }, { name: 'Spectroscopy Basics' }] },
                ],
            },
            {
                name: 'Mathematics',
                color: '#f97316',
                units: [
                    { name: 'Advanced Algebra', chapters: [{ name: 'Progressions (Advanced)' }, { name: 'Mathematical Induction' }] },
                    { name: 'Advanced Calculus', chapters: [{ name: 'Limit Evaluation' }, { name: 'Rolle and LMVT' }] },
                ],
            },
        ],
    },

    // ─── NEET UG ──────────────────────────────────────────────────────────────────
    {
        name: 'NEET UG',
        slug: 'neet-ug',
        category: 'NEET',
        description: 'NTA NEET UG – Physics, Chemistry, Botany, Zoology for MBBS/BDS admissions',
        subjects: [
            {
                name: 'Physics',
                color: '#3b82f6',
                units: [
                    { name: 'Mechanics', chapters: [{ name: 'Physical World & Measurement' }, { name: 'Kinematics' }, { name: 'Laws of Motion' }, { name: 'Work Energy Power' }, { name: 'Rotational Motion' }, { name: 'Gravitation' }] },
                    { name: 'Properties of Matter', chapters: [{ name: 'Mechanical Properties of Solids' }, { name: 'Mechanical Properties of Fluids' }, { name: 'Thermal Properties of Matter' }] },
                    { name: 'Thermodynamics', chapters: [{ name: 'Thermodynamics' }, { name: 'Kinetic Theory' }] },
                    { name: 'Oscillations & Waves', chapters: [{ name: 'Oscillations' }, { name: 'Waves' }] },
                    { name: 'Electrodynamics', chapters: [{ name: 'Electrostatics' }, { name: 'Current Electricity' }, { name: 'Magnetic Effects' }, { name: 'EMI and AC' }, { name: 'EM Waves' }] },
                    { name: 'Optics', chapters: [{ name: 'Ray Optics' }, { name: 'Wave Optics' }] },
                    { name: 'Modern Physics', chapters: [{ name: 'Dual Nature' }, { name: 'Atoms and Nuclei' }, { name: 'Electronic Devices' }] },
                ],
            },
            {
                name: 'Chemistry',
                color: '#22c55e',
                units: [
                    { name: 'Physical Chemistry', chapters: [{ name: 'Some Basic Concepts' }, { name: 'Atomic Structure' }, { name: 'Chemical Bonding' }, { name: 'Thermodynamics' }, { name: 'Equilibrium' }, { name: 'Electro & Surface' }, { name: 'Chemical Kinetics' }] },
                    { name: 'Inorganic Chemistry', chapters: [{ name: 'Periodic Table' }, { name: 'p-Block' }, { name: 'd & f Block' }, { name: 'Coordination Compounds' }] },
                    { name: 'Organic Chemistry', chapters: [{ name: 'GOC' }, { name: 'Hydrocarbons' }, { name: 'Alcohols & Ethers' }, { name: 'Aldehydes & Ketones' }, { name: 'Carboxylic Acids' }, { name: 'Amines' }, { name: 'Biomolecules & Polymers' }] },
                ],
            },
            {
                name: 'Botany',
                color: '#86efac',
                units: [
                    { name: 'Plant Diversity', chapters: [{ name: 'Biological Classification' }, { name: 'Plant Kingdom' }] },
                    { name: 'Plant Structure', chapters: [{ name: 'Anatomy of Flowering Plants' }, { name: 'Morphology of Flowering Plants' }] },
                    { name: 'Plant Physiology', chapters: [{ name: 'Transport in Plants' }, { name: 'Mineral Nutrition' }, { name: 'Photosynthesis' }, { name: 'Respiration in Plants' }, { name: 'Plant Growth & Development' }] },
                    { name: 'Genetics & Evolution', chapters: [{ name: 'Heredity and Variation' }, { name: 'Molecular Basis of Inheritance' }, { name: 'Evolution' }] },
                    { name: 'Ecology', chapters: [{ name: 'Ecosystem' }, { name: 'Biodiversity' }, { name: 'Environmental Issues' }] },
                ],
            },
            {
                name: 'Zoology',
                color: '#fb923c',
                units: [
                    { name: 'Animal Diversity', chapters: [{ name: 'Animal Kingdom' }] },
                    { name: 'Human Physiology', chapters: [{ name: 'Digestion and Absorption' }, { name: 'Breathing and Gas Exchange' }, { name: 'Body Fluids and Circulation' }, { name: 'Locomotion and Movement' }, { name: 'Neural Control' }, { name: 'Chemical Coordination' }] },
                    { name: 'Reproduction', chapters: [{ name: 'Reproduction in Organisms' }, { name: 'Human Reproduction' }, { name: 'Reproductive Health' }] },
                    { name: 'Genetics', chapters: [{ name: 'Principles of Inheritance' }, { name: 'Molecular Inheritance' }] },
                    { name: 'Biotech & Health', chapters: [{ name: 'Principles of Biotechnology' }, { name: 'Human Health and Disease' }] },
                ],
            },
        ],
    },

    // ─── NEET PG ─────────────────────────────────────────────────────────────────
    {
        name: 'NEET PG',
        slug: 'neet-pg',
        category: 'NEET',
        description: 'NTA NEET PG – clinical & pre-clinical subjects for MD/MS admissions',
        subjects: [
            { name: 'Anatomy', color: '#f87171', units: [{ name: 'Gross Anatomy', chapters: [{ name: 'Upper Limb' }, { name: 'Lower Limb' }, { name: 'Thorax' }, { name: 'Abdomen' }, { name: 'Pelvis' }, { name: 'Head and Neck' }] }, { name: 'Neuro Anatomy', chapters: [{ name: 'CNS & PNS' }] }] },
            { name: 'Physiology', color: '#fb923c', units: [{ name: 'Organ Systems', chapters: [{ name: 'Cardiovascular' }, { name: 'Respiratory' }, { name: 'GIT' }, { name: 'Renal' }, { name: 'Endocrine' }, { name: 'Neurophysiology' }] }] },
            { name: 'Biochemistry', color: '#facc15', units: [{ name: 'Metabolism', chapters: [{ name: 'Carbohydrate Metabolism' }, { name: 'Protein Metabolism' }, { name: 'Lipid Metabolism' }, { name: 'Nucleotide Metabolism' }] }] },
            { name: 'Pathology', color: '#a78bfa', units: [{ name: 'General & Systemic', chapters: [{ name: 'Cell Injury' }, { name: 'Neoplasia' }, { name: 'Inflammation' }, { name: 'Hematology' }] }] },
            { name: 'Microbiology', color: '#60a5fa', units: [{ name: 'Clinical Micro', chapters: [{ name: 'Bacteriology' }, { name: 'Virology' }, { name: 'Parasitology' }, { name: 'Mycology' }] }] },
            { name: 'Pharmacology', color: '#34d399', units: [{ name: 'Drug Classes', chapters: [{ name: 'Pharmacokinetics' }, { name: 'ANS Drugs' }, { name: 'Cardiovascular Drugs' }, { name: 'Antibiotics' }, { name: 'CNS Drugs' }] }] },
            { name: 'General Medicine', color: '#f472b6', units: [{ name: 'Systems', chapters: [{ name: 'Cardiology' }, { name: 'Pulmonology' }, { name: 'Nephrology' }, { name: 'Gastroenterology' }, { name: 'Neurology' }, { name: 'Endocrinology' }] }] },
            { name: 'Surgery', color: '#818cf8', units: [{ name: 'Clinical Surgery', chapters: [{ name: 'GI Surgery' }, { name: 'Urology' }, { name: 'Orthopedics' }, { name: 'Trauma' }] }] },
        ],
    },

    // ─── UPSC PRELIMS ────────────────────────────────────────────────────────────
    {
        name: 'UPSC Prelims',
        slug: 'upsc-prelims',
        category: 'UPSC',
        description: 'UPSC CSE Prelims – GS Paper I + CSAT Paper II for IAS/IPS screening',
        subjects: [
            {
                name: 'GS Paper I – General Studies',
                color: '#f97316',
                units: [
                    { name: 'History', chapters: [{ name: 'Ancient India' }, { name: 'Medieval India' }, { name: 'Modern India' }, { name: 'Art & Culture' }] },
                    { name: 'Geography', chapters: [{ name: 'Physical Geography' }, { name: 'Indian Geography' }, { name: 'Economic Geography' }, { name: 'World Geography' }] },
                    { name: 'Polity', chapters: [{ name: 'Constitutional Framework' }, { name: 'Parliament and Legislation' }, { name: 'Governance' }, { name: 'Panchayati Raj' }] },
                    { name: 'Economy', chapters: [{ name: 'National Income' }, { name: 'Fiscal Policy' }, { name: 'Banking and Finance' }, { name: 'Agriculture' }, { name: 'Infrastructure' }] },
                    { name: 'Environment', chapters: [{ name: 'Ecology & Environment' }, { name: 'Climate Change' }, { name: 'Biodiversity' }] },
                    { name: 'Science & Tech', chapters: [{ name: 'Basic Science' }, { name: 'Space Technology' }, { name: 'Defence Technology' }, { name: 'IT and Cyber' }] },
                    { name: 'Current Affairs', chapters: [{ name: 'National Affairs' }, { name: 'International Affairs' }, { name: 'Government Schemes' }] },
                ],
            },
            {
                name: 'GS Paper II – CSAT',
                color: '#6366f1',
                units: [
                    { name: 'Comprehension', chapters: [{ name: 'Reading Comprehension' }] },
                    { name: 'Logical Reasoning', chapters: [{ name: 'Analytical Reasoning' }, { name: 'Decision Making' }] },
                    { name: 'Maths & Data', chapters: [{ name: 'Quantitative Aptitude' }, { name: 'Data Interpretation' }] },
                ],
            },
        ],
    },

    // ─── UPSC MAINS ─────────────────────────────────────────────────────────────
    {
        name: 'UPSC Mains',
        slug: 'upsc-mains',
        category: 'UPSC',
        description: 'UPSC CSE Mains – GS1-4, Essay, Optional Paper for IAS selection',
        subjects: [
            { name: 'GS Paper 1', color: '#f97316', units: [{ name: 'History & Geography', chapters: [{ name: 'Indian Heritage and Culture' }, { name: 'Modern Indian History' }, { name: 'Post Independence' }, { name: 'World Geography' }, { name: 'Society and Social Issues' }] }] },
            { name: 'GS Paper 2', color: '#ec4899', units: [{ name: 'Polity & IR', chapters: [{ name: 'Constitution & Governance' }, { name: 'Social Justice' }, { name: 'International Relations' }] }] },
            { name: 'GS Paper 3', color: '#22c55e', units: [{ name: 'Economy & Security', chapters: [{ name: 'Indian Economy' }, { name: 'Technology' }, { name: 'Environment' }, { name: 'Security and Disaster' }] }] },
            { name: 'GS Paper 4', color: '#8b5cf6', units: [{ name: 'Ethics', chapters: [{ name: 'Ethics and Human Interface' }, { name: 'Integrity and Aptitude' }, { name: 'Case Studies' }] }] },
            { name: 'Essay', color: '#14b8a6', units: [{ name: 'Essay Writing', chapters: [{ name: 'Social Topics' }, { name: 'Philosophical Topics' }, { name: 'Technology Topics' }] }] },
            { name: 'Optional (Generic)', color: '#f59e0b', units: [{ name: 'Optional Paper I', chapters: [{ name: 'Optional Paper I – Section A' }, { name: 'Optional Paper I – Section B' }] }, { name: 'Optional Paper II', chapters: [{ name: 'Optional Paper II – Section A' }, { name: 'Optional Paper II – Section B' }] }] },
        ],
    },
];

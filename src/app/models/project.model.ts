export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: number; // 1-5 stars
  technologies: string[];
  category: string;
  status: 'completed' | 'in-progress' | 'planned';
  link?: string;
  github?: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'E-Commercio Platformon',
    description: 'Full-stack e-commerce solution with real-time inventory management and payment integration.',
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
    difficulty: 5,
    technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'Web Development',
    status: 'completed',
    link: 'https://example.com',
    github: 'https://github.com'
  },
  {
    id: 2,
    title: 'AI Chatto Assistix',
    description: 'Intelligent chatbot powered by machine learning for customer support automation.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    difficulty: 4,
    technologies: ['Python', 'TensorFlow', 'React', 'WebSocket'],
    category: 'AI & Machine Learning',
    status: 'completed',
    link: 'https://example.com'
  },
  {
    id: 3,
    title: 'Portfolion Dashboardos',
    description: 'Real-time crypto portfolio tracker with advanced analytics and market insights.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    difficulty: 3,
    technologies: ['Vue.js', 'D3.js', 'Firebase', 'CoinGecko API'],
    category: 'Finance',
    status: 'in-progress'
  },
  {
    id: 4,
    title: 'Social Analytixor Media',
    description: 'Comprehensive analytics platform for tracking social media performance across multiple channels.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    difficulty: 4,
    technologies: ['Angular', 'GraphQL', 'PostgreSQL', 'Redis'],
    category: 'Analytics',
    status: 'completed',
    github: 'https://github.com'
  },
  {
    id: 5,
    title: 'Mobile Fitnessor Appon',
    description: 'Cross-platform fitness tracking app with workout plans and nutrition guidance.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    difficulty: 4,
    technologies: ['React Native', 'TypeScript', 'Firebase', 'HealthKit'],
    category: 'Mobile Development',
    status: 'in-progress'
  },
  {
    id: 6,
    title: 'Homeon Dashboardix',
    description: 'IoT dashboard for controlling and monitoring smart home devices with automation rules.',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop',
    difficulty: 5,
    technologies: ['Angular', 'MQTT', 'InfluxDB', 'Docker'],
    category: 'IoT',
    status: 'completed',
    link: 'https://example.com'
  },
  {
    id: 7,
    title: 'Video Streamingo Saurus',
    description: 'Netflix-like streaming service with adaptive bitrate streaming and content recommendations.',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop',
    difficulty: 5,
    technologies: ['React', 'AWS', 'FFmpeg', 'Kubernetes'],
    category: 'Media & Entertainment',
    status: 'planned'
  },
  {
    id: 8,
    title: 'Task Managemon Toolix',
    description: 'Collaborative project management platform with kanban boards and team collaboration features.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    difficulty: 3,
    technologies: ['Angular', 'NestJS', 'PostgreSQL', 'WebSocket'],
    category: 'Productivity',
    status: 'completed',
    link: 'https://example.com',
    github: 'https://github.com'
  }
];


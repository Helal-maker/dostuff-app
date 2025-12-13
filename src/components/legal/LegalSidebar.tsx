import { useState, useEffect } from 'react';

interface Chapter {
  id: string;
  title: string;
}

interface LegalSidebarProps {
  chapters: Chapter[];
}

const LegalSidebar = ({ chapters }: LegalSidebarProps) => {
  const [activeChapter, setActiveChapter] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = chapters.map(chapter => document.getElementById(chapter.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveChapter(chapters[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapters]);

  const scrollToChapter = (chapterId: string) => {
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="sticky top-24 glass rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Contents</h3>
        <nav className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => scrollToChapter(chapter.id)}
              className={`block w-full text-left text-sm transition-colors duration-200 ${
                activeChapter === chapter.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {chapter.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default LegalSidebar;
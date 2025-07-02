interface SectionHeaderProps {
  title: string;
  className?: string;
}

const SectionHeader = ({ title, className }: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-center mb-8 ${className}`}>
      <div className="w-12 h-1 bg-gold-400 mr-4"></div>
      <h2 className="text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="w-12 h-1 bg-gold-400 ml-4"></div>
    </div>
  );
};

export default SectionHeader;

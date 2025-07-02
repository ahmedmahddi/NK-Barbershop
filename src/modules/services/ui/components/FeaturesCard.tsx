interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

const FeatureCard = ({ number, title, description }: FeatureCardProps) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-gold-400/10 p-6 group hover:shadow-gold transition-all">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
      <div className="text-gold-400 text-3xl mb-4 group-hover:scale-110 transition-transform">
        <span className="text-4xl font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
};

export default FeatureCard;

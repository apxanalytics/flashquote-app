import { useState } from 'react';
import { Play, Clock, ArrowLeft, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { videoTutorials, videoCategories, VideoTutorial } from '../data/videoTutorials';

export default function VideoTutorialsPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredVideos = selectedCategory === 'all'
    ? videoTutorials
    : videoTutorials.filter(v => v.category === selectedCategory);

  return (
          <div className="max-w-6xl mx-auto px-4 pb-12">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Video Tutorials
          </h1>
          <p className="text-xl text-gray-600">
            Watch and learn how to get the most out of FlashQuote
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {videoCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600'
              }`}
              style={selectedCategory === category.id ? {background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'} : {}}
            >
              {category.label}
            </button>
          ))}
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-600 transition-all cursor-pointer group shadow-md hover:shadow-xl"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No videos in this category</p>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              More Videos Coming Soon!
            </h3>
            <p className="text-gray-700 mb-4">
              We're actively producing new video tutorials. Check back soon for updates!
            </p>
            <p className="text-sm text-gray-600">
              In the meantime, check out our{' '}
              <Link to="/dashboard/help/faqs" className="text-blue-600 hover:underline font-semibold">
                FAQs
              </Link>
              {' '}or{' '}
              <Link to="/dashboard/help/support" className="text-blue-600 hover:underline font-semibold">
                contact support
              </Link>
              {' '}for help.
            </p>
          </div>
        </div>

        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="relative w-full max-w-5xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>

              <div className="aspect-video bg-black relative">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="p-6 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedVideo.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedVideo.duration}
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

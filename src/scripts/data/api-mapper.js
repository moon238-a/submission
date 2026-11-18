import Map from '../utils/map.js';

export async function storyMapper(story) {
  const hasCoordinate = story.lat !== null && story.lon !== null;
  return {
    ...story,
    location: hasCoordinate ? await Map.getPlaceNameByCoordinate(story.lat, story.lon) : null,
  };
}

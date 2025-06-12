window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('data/data.json');
    const data = await res.json();
    const playlists = data.playlists;

    const randomIndex = Math.floor(Math.random() * playlists.length);
    const playlist = playlists[randomIndex];

    document.getElementById("featured-title").textContent = playlist.playlist_name;
    document.getElementById("featured-cover").src = playlist.playlist_art;

    const songList = document.getElementById("featured-songs");
    songList.innerHTML = ""; 

    playlist.songs.forEach(song => {
      const li = document.createElement("li");
      li.classList.add("song-item");
      li.innerHTML = `
        <img src="${song.cover}" alt="${song.title} Cover">
        <div class = "song-info">
          <strong>${song.title}</strong>
          <p>${song.artist} <br><span class = "album">${song.album || ""}</span></p>
        </div>
        <span class = "duration">${song.duration}</span
      `;
      songList.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load playlist:", err);
  }
});

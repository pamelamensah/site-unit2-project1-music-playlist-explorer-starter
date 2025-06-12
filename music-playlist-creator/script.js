document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("playlist-container");

  const playlistDetailModal = document.getElementById("playlist-modal");
  const playlistDetailCloseBtn = playlistDetailModal.querySelector(".close-button");
  const shuffleButton = playlistDetailModal.querySelector(".shuffle-button");
  const modalArt = document.getElementById("modal-art");
  const modalName = document.getElementById("modal-name");
  const modalAuthor = document.getElementById("modal-author");
  const modalSongs = document.getElementById("modal-songs");

  const openAddPlaylistModalBtn = document.getElementById("open-add-playlist-modal");
  const addPlaylistModal = document.getElementById("add-playlist-modal");
  const addPlaylistCloseBtn = addPlaylistModal.querySelector(".add-playlist-close-button");
  const addPlaylistForm = document.getElementById("add-playlist-form");


  let allPlaylists = [];
  const LOCAL_STORAGE_KEY = "myPlaylists";
 

 
  function savePlaylists() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allPlaylists));
  }


  function loadPlaylists() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }



  const storedPlaylists = loadPlaylists();

  if (storedPlaylists && storedPlaylists.length > 0) {
    allPlaylists = storedPlaylists;
    allPlaylists.forEach(createPlaylistTile);
  } else {
    fetch("data/data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network error: " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        allPlaylists = data.playlists;
        allPlaylists.forEach(createPlaylistTile);
        savePlaylists();
      })
      .catch((err) => {
        console.error("Failed to load playlists:", err);
      });
  }

  addPlaylistForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("playlist_name").value;
    const author = document.getElementById("playlist_author").value;
    const art = document.getElementById("playlist_art").value;
    const rawSongs = document.getElementById("songs").value;

    const songs = rawSongs.split("\n").map((line) => {
      const [title, artist, duration] = line.split(',');
      return {
        title: title?.trim(),
        artist: artist?.trim(),
        duration: duration?.trim(),
        cover: art,
      };
    });

    const newPlaylist = {

      id: Date.now().toString(),
      playlist_name: name,
      playlist_author: author,
      playlist_art: art,
      songs: songs,
      likes: 0,
      liked: false
    };

    allPlaylists.push(newPlaylist);
    createPlaylistTile(newPlaylist);
    savePlaylists();

    e.target.reset();
    addPlaylistModal.classList.remove("show");
    updateEmptyMessage(); 
  });


  function createPlaylistTile(pl) {
    const tile = document.createElement("div");
    tile.className = "playlist-card";
    tile.dataset.playlistId = pl.id;

    tile.innerHTML = `
      <img src="${pl.playlist_art}" alt="${pl.playlist_name}">
      <h3>${pl.playlist_name}</h3>
      <p>By ${pl.playlist_author}</p>
      <span class="heart-icon ${pl.liked ? 'liked' : ''}">♥</span>
      <span class="like-count">${pl.likes}</span>
      <span class="delete-button">×</span> `;

    tile.addEventListener("click", (e) => {
      if (!e.target.classList.contains("heart-icon") && !e.target.classList.contains("delete-button")) {
        openPlaylistDetailModal(pl);
      }
    });

    const heart = tile.querySelector(".heart-icon");
    const count = tile.querySelector(".like-count");
    heart.addEventListener("click", (e) => {
      e.stopPropagation(); 
      let n = parseInt(count.textContent, 10);

      const targetPlaylist = allPlaylists.find((p) => p.id === pl.id);

      if (heart.classList.contains("liked")) {
        heart.classList.remove("liked");
        count.textContent = --n;
        if (targetPlaylist) {
          targetPlaylist.likes = n;
          targetPlaylist.liked = false;
        }
      } else {
        heart.classList.add("liked");
        count.textContent = ++n;
        if (targetPlaylist) {
          targetPlaylist.likes = n;
          targetPlaylist.liked = true;
        }
      }
      savePlaylists();
    });

    const deleteButton = tile.querySelector(".delete-button");
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation(); 
    
      if (confirm(`Are you sure you want to delete "${pl.playlist_name}"?`)) {
  
        allPlaylists = allPlaylists.filter(playlist => playlist.id !== pl.id);
        savePlaylists(); 

        tile.remove();
        updateEmptyMessage();
      }
    });

    container.appendChild(tile);
  }


  function openPlaylistDetailModal(pl) {
    modalArt.src = pl.playlist_art;
    modalName.textContent = pl.playlist_name;
    modalAuthor.textContent = "By " + pl.playlist_author;
    modalSongs.innerHTML = "";
    pl.songs.forEach((s) => {
      const li = document.createElement("li");
      li.classList.add("song-item");
      li.innerHTML = `
        <img src="${s.cover || 'https://via.placeholder.com/50'}" alt="${s.title} Cover"> <div class="song-info">
          <strong>${s.title}</strong>
          <p>${s.artist}<br><span class="album">${s.album || ""}</span></p>
        </div>
        <span class="duration">${s.duration}</span>
      `;
      modalSongs.appendChild(li);
    });
    playlistDetailModal.classList.add("show");
  }



  playlistDetailCloseBtn.addEventListener("click", () => {
    playlistDetailModal.classList.remove("show");
  });
  playlistDetailModal.addEventListener("click", (e) => {
    if (e.target === playlistDetailModal) {
      playlistDetailModal.classList.remove("show");
    }
  });


  shuffleButton.addEventListener("click", () => {
    const songs = Array.from(modalSongs.children);
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    modalSongs.innerHTML = "";
    songs.forEach((song) => modalSongs.appendChild(song));
  });


  openAddPlaylistModalBtn.addEventListener("click", () => {
    addPlaylistModal.classList.add("show");
  });

  addPlaylistCloseBtn.addEventListener("click", () => {
    addPlaylistModal.classList.remove("show");
  });

  addPlaylistModal.addEventListener("click", (e) => {
    if (e.target === addPlaylistModal) {
      addPlaylistModal.classList.remove("show");
    }
  });


  function updateEmptyMessage() {
    const emptyMessage = document.getElementById("empty-message");
    if (allPlaylists.length === 0) {
      emptyMessage.style.display = 'block';
    } else {
      emptyMessage.style.display = 'none';
    }
  }

  updateEmptyMessage();
});
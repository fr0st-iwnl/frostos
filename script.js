//------------------------------------- MAIN VARIABLES -------------------------------------------------------------- //

const terminal = document.getElementById('terminal');
const output = document.getElementById('output');
const inputLine = document.getElementById('input-line');
const commandLine = document.getElementById('command-line');
const rootUserForm = document.getElementById('root-user-form');
const createRootUserButton = document.getElementById('create-root-user');
let audio;
let currentSong = '';
let endOfSongDisplayed = false;
let isInputFocused = false;
let commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];
let historyIndex = -1;
let rootUser = JSON.parse(localStorage.getItem('rootUser'));
let cmatrixRunning = false;
let cmatrixInterval;




//------------------------------------- KEYBOARD INPUT KEY : / -------------------------------------------------------------- //
document.addEventListener('keydown', function (event) {
  if (event.key === '/' && event.target.tagName !== 'INPUT') {
    event.preventDefault(); // Prevent the default action of the key
    document.getElementById('command-line').focus();
  }
});


//------------------------------------- ROOT PART DONT TOUCH -------------------------------------------------------------- //
document.addEventListener("DOMContentLoaded", function () {
  // Check if ROOT user exists in localStorage
  if (!rootUser) {
    terminal.style.display = 'none';
    rootUserForm.style.display = 'flex';
    taskbar.style.display = 'none'; // Hide the taskbar if root user doesn't exist
  } else {
    rootUserForm.style.display = 'none';
    terminal.style.display = 'block';
    updatePrompt();
    taskbar.style.display = 'block'; // Show the taskbar if root user exists
  }

  createRootUserButton.addEventListener('click', () => {
    const rootUsername = document.getElementById('root-username').value.trim();
    const rootPassword = document.getElementById('root-password').value.trim();

    // Regular expression to match single-word usernames
    const singleWordRegex = /^[a-zA-Z]+$/;

    if (rootUsername && rootPassword) {
      if (!singleWordRegex.test(rootUsername)) {
        alert('Please input a single word for the username without any additional numbers or symbols.');
        return; // Exit the function if the username format is incorrect
      }

      // Make the output area visible
      outputjs.style.display = 'block';
      // Displaying "Creating ROOT User..." message
      // Array of texts to display
      const texts = [
        "− Setting up environment...",
        "− Configuring system...",
        "− Installing packages...",
        "− Applying settings...",
        "− Initializing system...",
        "− Creating user profiles...",
        "− Optimizing performance...",
        "− Loading essential components...",
        "− Configuring network settings...",
        "− Setting up security protocols...",
        "− Checking system integrity...",
        "− Applying updates...",
        "⁂ Finalizing setup & 🗑 Removing all messages...",
      ];

      // Function to display text with animation and delay
      function displayTextWithAnimationAndDelay(outputElement, text, delay) {
        setTimeout(() => {
          // Make the output area visible
          outputElement.style.display = 'block';
          // Displaying text
          outputElement.innerHTML = `<div class="animation">${text}</div>`;
          // Set timeout to hide the text after 8 seconds
          setTimeout(() => {
            // Hide the text after 8 seconds
            outputElement.innerHTML = '';
            outputElement.style.display = 'none';
          }, 8000);
        }, delay);
      }

      // Display each text with animation and delay
      texts.forEach((text, index) => {
        displayTextWithAnimationAndDelay(document.getElementById(`outputjs${index + 2}`), text, (index + 1) * 500);
      });

      setTimeout(() => {
        // After 8 seconds, proceed to log in
        rootUser = { username: rootUsername, password: rootPassword };
        localStorage.setItem('rootUser', JSON.stringify(rootUser));
        rootUserForm.style.display = 'none';
        terminal.style.display = 'block';
        updatePrompt();
        taskbar.style.display = 'block'; // Show the taskbar after root user is created
      }, 8000); // 8000 milliseconds = 8 seconds
    } else {
      alert('Please enter both username and password.');
    }
  });
});



commandLine.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    const command = commandLine.value.trim();
    if (command !== '') {
      displayCommand(command);
      commandHistory.push(command);
      localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
      historyIndex = -1;
      executeCommand(command);
    }
    commandLine.value = '';
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandLine.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      commandLine.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else {
      historyIndex = -1;
      commandLine.value = '';
    }
  }
});


function displayCommand(command) {
  if (command !== 'clear') {
    output.innerHTML += `<div>${rootUser.username}@frostOS:~$ ${command}</div>`;
  }
  terminal.scrollTop = terminal.scrollHeight;
}

function executeCommand(command) {
  const args = command.split(' ');
  const mainCommand = args[0].toLowerCase();
  const params = args.slice(1);
  switch (mainCommand) {
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // CLEAR COMMAND
    case 'clear':
      clearTerminal();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // PASSWD COMMAND
    case 'passwd':
      if (params.length === 1) {
        const newPassword = params[0];
        changePassword(newPassword);
      } else {
        output.innerHTML += `<div>Usage: passwd [new-password]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // ECHO COMMAND 
    case 'echo':
      if (params.length > 0) {
        let message = '';
        if (params[0] === '$SHELL') {
          message = '/bin/bash'; // Default shell path
        } else {
          message = params.join(' '); // If not a special variable, echo the message
        }
        output.innerHTML += `<div>${message}</div>`;
      } else {
        output.innerHTML += `<div>Usage: echo [message|$SHELL]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // CD COMMAND
    case 'cd':
      if (params.length === 1) {
        changeDirectory(params[0]);
      } else {
        output.innerHTML += `<div>Usage: cd [directory]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // LS COMMAND
    case 'ls':
      listDirectory();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // OPEN COMMAND
    case 'open':
      if (params.length === 1) {
        const target = params[0];
        if (currentDirectory === '/github' && target === 'frostos') {
          window.open('https://github.com/fr0st-iwnl/frostos', '_blank');
        } else {
          output.innerHTML += `<div>No such target to open: ${target}</div>`;
        }
      } else {
        output.innerHTML += `<div>Usage: open [target]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // CAT COMMAND
    case 'cat':
      if (params.length === 1) {
        const target = params[0];
        if (currentDirectory === '/github' && target === 'README.txt') {
          output.innerHTML += `
      <div>To preview the source code of FrostOS :</div>
        <div>Use the open command to display the frostOS repo [open frostos]</div>
      `;
        } else {
          output.innerHTML += `<div>No such target to read: ${target}</div>`;
        }
      } else {
        output.innerHTML += `<div>Usage: cat [target]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // HELP COMMAND
    case 'help':
      displayCategorizedHelp();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // NEOFETCH COMMAND
    case 'neofetch':
      neofetch();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // PLAY SONG COMMAND
    case 'play':
      if (params.length > 0) {
        playMusic(params.join(' '));
      } else {
        output.innerHTML += `<div>Usage: play [song]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // STOP SONG COMMAND
    case 'stop':
      stopMusic();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // PAUSE SONG COMMAND
    case 'pause':
      pauseMusic();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // VOLUME SONG COMMAND
    case 'volume':
      if (params.length > 0) {
        const volumeLevel = parseFloat(params[0]);
        setVolume(volumeLevel);
      } else {
        output.innerHTML += `<div>Usage: volume [level] (0.0 - 1.0)</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // SEARCH COMMAND
    case 'search':
      if (params.length > 0) {
        const query = params.join(' ');
        output.innerHTML += `<div>Searching with DuckDuckGo for "${query}"...</div>`;
        searchDuckDuckGo(query);
      } else {
        output.innerHTML += `<div>Usage: search [query]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // WHOAMI COMMAND
    case 'whoami':
      displayCurrentUser();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // CMATRIX COMMAND
    case 'cmatrix':
      toggleCmatrix();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // REBOOT COMMAND
    case 'reboot':
      rebootSystem();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // EXIT COMMAND
      case 'exit':
        endGame();
        break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // CALC COMMAND
    case 'calc':
      if (params.length === 1) {
        const expression = params[0];
        calculate(expression);
      } else {
        output.innerHTML += `<div>Usage: calc [expression]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // DELUSER COMMAND
    case 'deluser':
      handleDelUserCommand(command);
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // NSLOOKUP COMMAND
    case 'nslookup':
      if (params.length === 1) {
        performNslookup(params[0]);
      } else {
        output.innerHTML += `<div>Usage: nslookup [domain]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // HANGMAN GAME COMMAND
      case 'hangman':
            // Select a random word
            word = wordList[Math.floor(Math.random() * wordList.length)];
            guessedLetters = [];
            incorrectGuesses = 0;
            displayHangman();
            output.innerHTML += 'Word: ' + displayWord() + '<br>';
            break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // GUESS COMMAND FOR HANGMAN
        case 'guess':
            if (!word) {
                output.innerHTML += 'Please start the game first using the "starthangman" command.<br>';
                break;
            }
            const letter = prompt('Enter a letter to guess:');
            if (letter && letter.length === 1 && letter.match(/[a-z]/i)) {
                handleGuess2(letter.toLowerCase());
            } else {
                output.innerHTML += 'Please enter a valid letter.<br>';
            }
            break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
    // THEME COMMAND
    case 'theme':
      if (params.length > 0) {
        changeTheme(params[0]);
      } else {
        output.innerHTML += `<div>Usage: theme [theme-name]</div>`;
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
      // GUESSING GAME COMMAND
      case 'guessinggame':
      startGuessingGame();
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
      // DEFAULT ERROR COMMAND NOT FOUND
    default:
      if (!gameIsRunning) {
        output.innerHTML += `<div>bash: ${mainCommand}: command not found</div>`;
      } else {
        // If the game is running, handle the user's guess
        handleGuess(mainCommand);
      }
      break;
//-------------------------------------------------------------------------------------------------------------------------------------------------------//
  }
  terminal.scrollTop = terminal.scrollHeight;
}


//------------------------------------------------------------ GAME 1 ------------------------------------------------------------------------------ //


let gameIsRunning = false;
let randomNumber;

function startGuessingGame() {
  gameIsRunning = true;
  randomNumber = Math.floor(Math.random() * 100) + 1;
  output.innerHTML += `<div>Guess a number between 1 and 100:</div>`;
}

function handleGuess(command) {
  const guess = parseInt(command);
  if (!isNaN(guess)) {
    if (guess === randomNumber) {
      output.innerHTML += `<div>Congratulations! You guessed the number ${randomNumber} correctly!</div>`;
      gameIsRunning = false;
    } else if (guess < randomNumber) {
      output.innerHTML += `<div>Your guess (${guess}) is too low. Try again:</div>`;
    } else {
      output.innerHTML += `<div>Your guess (${guess}) is too high. Try again:</div>`;
    }
  } else {
    output.innerHTML += `<div>Please enter a valid number:</div>`;
  }
}


//------------------------------------------------------------ GAME 2 ------------------------------------------------------------------------------ //



const wordList = ['frostos', 'javascript', 'programming', 'terminal', 'templeos', 'developer'];

// select a random word from the list
let word = '';

// initial states of the game
let guessedLetters = [];
let incorrectGuesses = 0;
const maxIncorrectGuesses = 6; // number of parts (incorrect guesses)

// output terminal (dont create a normal output like e.g const output because it already exists)
const output2 = document.getElementById('output');

// pre tags for hangmanParts
function displayHangman() {
    const hangmanParts = [
        `<pre>
        ________
        |      |
        |      
        |     
        |
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |     
        |
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |      |
        |
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |     /|
        |
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |     /|\\
        |
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |     /|\\
        |     /
        |
        |
        |
      __|______
      |       |
      </pre>`,
        `<pre>
        ________
        |      |
        |      O
        |     /|\\
        |     / \\
        |
        |
        |
      __|______
      |       |
      </pre>`
    ];

    output.innerHTML = hangmanParts[incorrectGuesses];
}


function displayWord() {
    let displayedWord = '';
    for (let char of word) {
        if (guessedLetters.includes(char)) {
            displayedWord += char + ' ';
        } else {
            displayedWord += '_ ';
        }
    }
    return displayedWord;
}

// Function to handle user guesses WATCH OUT FOR HANDLEGUESS FUNCTIONS!
function handleGuess2(letter) {
    if (!word.includes(letter)) {
        incorrectGuesses++;
    }
    guessedLetters.push(letter);
    // display the current state of the game (update status)
    displayHangman();
    output.innerHTML += 'Word: ' + displayWord() + '<br>';
    if (displayWord().replace(/ /g, '') === word) {
        output.innerHTML += 'Congratulations! You guessed the word: ' + word + '<br>';
    } else if (incorrectGuesses >= maxIncorrectGuesses) {
        output.innerHTML += 'Sorry, you lose! The word was: ' + word + '<br>';
    }
}


function endGame() {
  if (word || gameIsRunning) {
      word = '';
      guessedLetters = [];
      incorrectGuesses = 0;
      gameIsRunning = false;
      output.innerHTML += `<div>Game ended.</div>`;
  } else {
      output.innerHTML += `<div>No game is currently running.</div>`;
  }
}


//------------------------------------- CMATRIX -------------------------------------------------------------- //

function toggleCmatrix() {
  if (cmatrixRunning) {
    stopCmatrix();
    cmatrixRunning = false;
  } else {
    startCmatrix();
    cmatrixRunning = true;
  }
}

function startCmatrix() {
  output.innerHTML = '';

  // Set up cmatrix animation
  const matrixChars = ['0', '1']; // Characters for the animation
  let matrixRowCount = 10; // Number of rows for normal screens
  let matrixColCount = 130; // Number of columns for normal screens
  const speed = 100; // Animation speed in milliseconds

  // Check if the screen width is below a certain threshold (for example, 600px)
  if (window.innerWidth <= 600) {
    matrixRowCount = 10; // Set number of rows to 1 for low-resolution screens
    matrixColCount = 30; // Set number of columns to 30 for low-resolution screens
  }

  const matrix = Array.from({ length: matrixRowCount }, () => []);

  for (let row = 0; row < matrixRowCount; row++) {
    for (let col = 0; col < matrixColCount; col++) {
      matrix[row][col] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    }
  }

  function updateMatrix() {
    for (let row = matrixRowCount - 1; row > 0; row--) {
      matrix[row] = matrix[row - 1];
    }

    matrix[0] = matrix[0].map(() => matrixChars[Math.floor(Math.random() * matrixChars.length)]);

    const matrixOutput = matrix.map(row => row.join('')).join('\n');
    output.textContent = matrixOutput;
  }

  cmatrixInterval = setInterval(updateMatrix, speed);
}


function stopCmatrix() {
  clearInterval(cmatrixInterval);
  cmatrixInterval = null;

  output.innerHTML = '';
}

//------------------------------------- DELUSER -------------------------------------------------------------- //

function deleteRootUser() {
  localStorage.removeItem('rootUser');
}

// Function to handle deluser command
function handleDelUserCommand(command) {
  if (command === 'deluser') {
    if (confirm("Are you sure you want to delete the root user?")) {
      deleteRootUser();
      window.location.reload(); // Refresh the page
    }
    return true; 
  }
  return false; // Command not handled
}




//------------------------------------- NSLOOKUP FUNCTION -------------------------------------------------------------- //

async function performNslookup(domain) {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '');

  const apiUrl = `https://dns.google/resolve?name=${domain}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.Status === 0 && data.Answer) {
      data.Answer.forEach(answer => {
        output.innerHTML += `<div>${answer.name} - ${getTypeName(answer.type)} - ${answer.data}</div>`;
      });
    } else {
      output.innerHTML += `<div>No DNS records found for ${domain}</div>`;
    }
  } catch (error) {
    output.innerHTML += `<div>Error performing nslookup: ${error.message}</div>`;
  }
  terminal.scrollTop = terminal.scrollHeight;
}

function getTypeName(type) {
  switch (type) {
    case 1:
      return 'A';
    case 2:
      return 'NS';
    case 5:
      return 'CNAME';
    case 6:
      return 'SOA';
    case 12:
      return 'PTR';
    case 15:
      return 'MX';
    case 16:
      return 'TXT';
    case 28:
      return 'AAAA';
    default:
      return type;
  }
}


function displayCurrentUser() {
  output.innerHTML += `<div>${rootUser.username}</div>`;
}

//------------------------------------- CALCULATE FUNCTION -------------------------------------------------------------- //
function calculate(expression) {
  try {
    const result = eval(expression);
    output.innerHTML += `<div>${expression} = ${result}</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error: ${error}</div>`;
  }
}

//------------------------------------- REBOOT FUNCTION -------------------------------------------------------------- //
function rebootSystem() {
  clearTerminal();

  const lockedScreen = document.createElement('div');
  lockedScreen.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;">
      <div style="text-align: center; color: white; padding: 20px;">
        <h2>System is rebooting.</h2>
        <p>Please wait while the system reboots...</p>
      </div>
    </div>
  `;
  document.body.appendChild(lockedScreen);

  setTimeout(() => {
    lockedScreen.remove();
    output.innerHTML += `<div>Rebooting system...</div>`;
    setTimeout(() => {
      location.reload();
    }, 2000);
  }, 2000);
}


//------------------------------------- CHANGE DIRECTORY FUNCTION -------------------------------------------------------------- //
function changeDirectory(directory) {
  if (directory === 'github') {
    currentDirectory = '/github'; // Update current directory path
    updatePrompt(); // Update the prompt to display the new path
  } else if (directory === '../') {
    currentDirectory = '~'; // Navigate to the parent directory (home directory)
    updatePrompt(); // Update the prompt to display the new path
  } else if (directory === 'frostos') {
    output.innerHTML += `<div>bash: cd: ${directory}: Folder is locked.</div>`;
    currentDirectory = '/github'; // Update current directory path
    updatePrompt(); // Update the prompt to display the new path
  }
  else {
    output.innerHTML += `<div>bash: cd: ${directory}: No such file or directory</div>`;
  }
}


let currentDirectory = '~'; // main home directory


//------------------------------------- LIST DIRECTORY FUNCTION -------------------------------------------------------------- //
function listDirectory() {
  if (currentDirectory === '/github') {
    output.innerHTML += `
      <div><span style="color: #94b113;">* 📂 frostos</span></div>
      <div><span style="color: #5baeb5;">* 📄 README.txt</span></div>
    `;
  } else if (currentDirectory === '~') {
    output.innerHTML += `
    <div><span style="color: #458588;">📁 github</span></div>
    `;
  } else {
    output.innerHTML += `<div>${rootUser.username}@frostOS:${currentDirectory}$</div>`;
  }
}



//------------------------------------- OPEN FILE OR DIRECTORY FUNCTION-------------------------------------------------------------- //
function openFileOrDirectory(name) {
  if (currentDirectory === 'github') {
    if (name === 'github') {
      window.open('https://github.com', '_blank');
    } else if (name === 'source') {
      window.open('https://github.com/your-repository-name/your-file-path', '_blank');
    } else {
      output.innerHTML += `<div>bash: open: ${name}: No such file or directory</div>`;
    }
  } else {
    output.innerHTML += `<div>bash: open: ${name}: No such file or directory</div>`;
  }
}



//------------------------------------- NEOFETCH FUNCTION-------------------------------------------------------------- //

function neofetch() {
  const resolution = `${window.screen.width}x${window.screen.height}`;
  // Specific ASCII art
  const asciiArt = `
    <pre>
      ______                __  ____  _____
     / ____/________  _____/ /_/ __ \\/ ___/
    / /_  / ___/ __ \\/ ___/ __/ / / /\\__ \\ 
   / __/ / /  / /_/ (__  ) /_/ /_/ /___/ / 
  /_/   /_/   \\____/____/\\__/\\____//____/  
                                           
    </pre>
  `;

  // Get the user's operating system
  let os;
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) {
    os = 'Windows';
  } else if (platform.includes('mac')) {
    os = 'Mac OS';
  } else if (platform.includes('linux')) {
    os = 'Linux';
  } else if (platform.includes('iphone') || platform.includes('ipad')) {
    os = 'iOS';
  } else if (platform.includes('android')) {
    os = 'Android';
  } else {
    os = 'Unknown';
  }

  // Get the kernel based on the browser
  let kernel;
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('firefox') !== -1) {
    kernel = 'Firefox (Gecko)';
  } else if (userAgent.indexOf('chrome') !== -1 || userAgent.indexOf('chromium') !== -1) {
    kernel = 'Chrome (Blink)';
  } else {
    kernel = 'Webkit';
  }

  // Calculate the uptime since the user has been on the website
  const now = new Date();
  const loadTime = new Date(performance.timing.navigationStart);
  const uptimeMilliseconds = now - loadTime;
  const hours = Math.floor(uptimeMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptimeMilliseconds % (1000 * 60)) / 1000);
  const uptime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

  // Get the selected theme from localStorage
  const selectedTheme = localStorage.getItem('selectedTheme') || 'gruvbox';
  const theme = themes[selectedTheme];

  // Neofetch output with specific ASCII art and theme information
  const neofetchOutput = `
    <div class="neofetch-container">
      <div class="ascii-art-neofetch">
        ${asciiArt}
      </div>
      <pre>
        <code>
        ┌──────────────────────────────────────┐
          <b><i class="fa-light fa-computer"></i> OS</b>: ${os}
          <b><i class="fa-brands fa-hive"></i> Host</b>: Netlify
          <b><i class="fa-solid fa-cloud-binary"></i> Kernel</b>: ${kernel}
          <b><i class="fa-solid fa-timer"></i> Uptime</b>: ${uptime}
          <b><i class="fa-solid fa-high-definition"></i> Resolution</b>: ${resolution}
          <b><i class="fa-solid fa-crab"></i> Shell</b>: /bin/bash
          <b><i class="fa-solid fa-roller-coaster"></i> Theme</b>: ${selectedTheme}
          <b><i class="fa-solid fa-terminal"></i> Terminal</b>: kitty (web-based)
          <b><i class="fa-light fa-rectangle-terminal"></i> Terminal Font</b>: Monospace
        └────────────────────<b style="color: #7c6f64; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #cc241d; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #98971a; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #98971a; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #458588; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #b16286; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #689d6a; font-size: 1.29em; padding: 0.1em;">x</b><b style="color: #bdae93; font-size: 1.29em; padding: 0.1em;">x</b>─────┘
        </code>
      </pre>
    </div>
  `;
  output.innerHTML += neofetchOutput;
  terminal.scrollTop = terminal.scrollHeight;
}


//------------------------------------- PLAY MUSIC FUNCTION -------------------------------------------------------------- //



function playMusic(song) {
  const songPaths = {
    'algysxx': './songs/algysxx.mp3',
    'dazies': './songs/dazies.mp3',
    'theendoftheworld': './songs/theendoftheworld.mp3',
    'econyalu2008': './songs/econyalu2008.mp3',
    'takingdrugs': './songs/takingdrugs.mp3',
    'stylerz04': './songs/stylerz04.mp3',
    'handsonthewheel': './songs/handsonthewheel.mp3',
    'yng16': './songs/yng16.mp3',
    'yourlove': './songs/yourlove.mp3',
  };
  const songPath = songPaths[song];

  if (!songPath) {
    output.innerHTML += `<div>Song not found: ${song}</div>`;
    terminal.scrollTop = terminal.scrollHeight;
    return;
  }

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener('ended', handleAudioEnd);
    audio.removeEventListener('timeupdate', updateSongInfo);
    endOfSongDisplayed = false;
  }

  audio = new Audio(songPath);
  audio.volume = 0.1; // Set volume to 0.1
  audio.play().catch(function (error) {
    output.innerHTML += `<div>Error playing ${song}: ${error}</div>`;
    terminal.scrollTop = terminal.scrollHeight;
  });

  audio.addEventListener('ended', handleAudioEnd);
  audio.addEventListener('timeupdate', updateSongInfo);
  currentSong = song;
  terminal.scrollTop = terminal.scrollHeight;
}


function handleAudioEnd() {
  if (!endOfSongDisplayed) {
    output.innerHTML += `<div>Song ended: ${currentSong}</div>`;
    endOfSongDisplayed = true;
    terminal.scrollTop = terminal.scrollHeight;
  }
}

let lastProgressBarUpdate = 0;
const progressBarUpdateInterval = 1000; // update progress bar every 1 sec

function updateSongInfo() {
  if (!cmatrixRunning) {
    const currentTime = formatTime(audio.currentTime);
    const duration = formatTime(audio.duration);
    const progressBar = generateProgressBar(audio.currentTime, audio.duration);
    const now = Date.now();
    
    // check if its time to update the progress bar
    if (now - lastProgressBarUpdate >= progressBarUpdateInterval) {
      const songInfoDiv = document.getElementById('song-info');
      if (!songInfoDiv) {
        const newSongInfoDiv = document.createElement('div');
        newSongInfoDiv.id = 'song-info';
        output.appendChild(newSongInfoDiv);
      }
      const songInfoContent = `
        <div>Now playing: ${currentSong}</div>
        <div>${currentTime} —${progressBar} ${duration}</div>
      `;
      document.getElementById('song-info').innerHTML = songInfoContent;
      lastProgressBarUpdate = now;
    }
  }
}


function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

function generateProgressBar(currentTime, duration) {
  const progress = (currentTime / duration) * 100;
  const progressBar = '—'.repeat(Math.floor(progress / 2)) + '◦' + '—'.repeat(Math.floor((100 - progress) / 2));
  return progressBar;
}


function stopMusic() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener('ended', handleAudioEnd);
    audio.removeEventListener('timeupdate', updateSongInfo);
    output.innerHTML += `<div>Music stopped.</div>`;
    terminal.scrollTop = terminal.scrollHeight;
    const songInfoDiv = document.getElementById('song-info');
    if (songInfoDiv) {
      songInfoDiv.remove();
    }
  }
}

function pauseMusic() {
  if (audio && !audio.paused) {
    audio.pause();
    output.innerHTML += `<div>Music paused.</div>`;
  } else if (audio && audio.paused) {
    audio.play().catch(function (error) {
      output.innerHTML += `<div>Error resuming music: ${error}</div>`;
    });
    output.innerHTML += `<div>Music resumed.</div>`;
  } else {
    output.innerHTML += `<div>No music is currently playing.</div>`;
  }
  terminal.scrollTop = terminal.scrollHeight;
}

function setVolume(level) {
  if (audio) {
    const volume = Math.min(Math.max(level, 0), 1); // Ensure volume is between 0 and 1
    audio.volume = volume;
    output.innerHTML += `<div>Volume set to ${Math.round(volume * 100)}%</div>`;
  } else {
    output.innerHTML += `<div>No music is currently playing.</div>`;
  }
  terminal.scrollTop = terminal.scrollHeight;
}

//------------------------------------- CLEAR TERMINAL FUNCTION -------------------------------------------------------------- //

function clearTerminal() {
  // Check if the game is running
  if (gameIsRunning) {
    // If the game is running, end it
    gameIsRunning = false;
    output.innerHTML += `<div>Game ended.</div>`;
  }

  if (word) {
    // If the game is running, end it
    endGame();
}
  // Clear the terminal output
  output.innerHTML = '';

   /* OLD AUDIO THAT I WAS USING COMMENTED IT JUST IN CASE I DO SOMETHING
  if (audio && !audio.paused) {
    output.innerHTML += `<div>Now playing: ${currentSong}</div>`;
    updateSongInfo();
  }
  */
}


//------------------------------------- SEARCH WITH DUCKDUCKGO FUNCTION -------------------------------------------------------------- //
function searchDuckDuckGo(query) {
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  window.open(searchUrl, '_blank');
}

//------------------------------------- UPDATE PROMPT FUNCTION -------------------------------------------------------------- //
function updatePrompt() {
  document.getElementById('prompt').innerText = `${rootUser.username}@frostOS:${currentDirectory}$`;
}







//------------------------------------- THEMES -------------------------------------------------------------- //
const themes = {
  gruvbox: {
    backgroundColor: '#282828',
    color: '#ebdbb2',
    promptColor: '#b8bb26',
    inputBackgroundColor: '#282828',
    inputColor: '#ebdbb2',
    formBackgroundColor: '#383737',
    formInputBackgroundColor: '#504945',
    formInputBorderColor: '#b8bb26',
    githubColor: '#3b6b6e',
    formButtonBackgroundColor: '#ebdbb2',
    formButtonColor: '#282c34'
  },
  dark: {
    backgroundColor: '#1e1e1e',
    color: '#c5c5c5',
    promptColor: '#569cd6',
    inputBackgroundColor: '#1e1e1e',
    inputColor: '#c5c5c5',
    formBackgroundColor: '#2d2d2d',
    formInputBackgroundColor: '#333333',
    formInputBorderColor: '#569cd6',
    formButtonBackgroundColor: '#569cd6',
    formButtonColor: '#1e1e1e'
  },
  light: {
    backgroundColor: '#f5f5f5',
    color: '#333333',
    promptColor: '#007acc',
    inputBackgroundColor: '#f5f5f5',
    inputColor: '#333333',
    formBackgroundColor: '#e0e0e0',
    formInputBackgroundColor: '#ffffff',
    formInputBorderColor: '#007acc',
    formButtonBackgroundColor: '#007acc',
    formButtonColor: '#f5f5f5'
  },
  midnight: {
    backgroundColor: '#0F0F0F',
    color: '#CCCCCC',
    promptColor: '#00FF00',
    inputBackgroundColor: '#0F0F0F',
    inputColor: '#CCCCCC',
    formBackgroundColor: '#333333',
    formInputBackgroundColor: '#1F1F1F',
    formInputBorderColor: '#00FF00',
    formButtonBackgroundColor: '#00FF00',
    formButtonColor: '#0F0F0F'
  },
  celestial: {
    backgroundColor: '#0F0F1A',
    color: '#FFFFFF',
    promptColor: '#6E7FFF',
    inputBackgroundColor: '#0F0F1A',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#141424',
    formInputBackgroundColor: '#1F1F3F',
    formInputBorderColor: '#6E7FFF',
    formButtonBackgroundColor: '#6E7FFF',
    formButtonColor: '#0F0F1A'
  },
  golden: {
    backgroundColor: '#1B1916',
    color: '#FFFFFF',
    promptColor: '#FFD700',
    inputBackgroundColor: '#1B1916',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#2C2922',
    formInputBackgroundColor: '#4C493F',
    formInputBorderColor: '#FFD700',
    formButtonBackgroundColor: '#FFD700',
    formButtonColor: '#1B1916'
  },
  aurora: {
    backgroundColor: '#05070E',
    color: '#FFFFFF',
    promptColor: '#FFA500',
    inputBackgroundColor: '#05070E',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#0F1424',
    formInputBackgroundColor: '#2B3852',
    formInputBorderColor: '#FFA500',
    formButtonBackgroundColor: '#FFA500',
    formButtonColor: '#05070E'
  },
  kde: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    promptColor: '#6ABEFF',
    inputBackgroundColor: '#333333',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#444444',
    formInputBackgroundColor: '#555555',
    formInputBorderColor: '#6ABEFF',
    formButtonBackgroundColor: '#6ABEFF',
    formButtonColor: '#333333'
  },
  indigo: {
    backgroundColor: '#202A36',
    color: '#FFFFFF',
    promptColor: '#BBB6DF',
    inputBackgroundColor: '#202A36',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#283141',
    formInputBackgroundColor: '#3C4A5A',
    formInputBorderColor: '#BBB6DF',
    formButtonBackgroundColor: '#BBB6DF',
    formButtonColor: '#202A36'
  },

  space: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    promptColor: '#00FFFF',
    inputBackgroundColor: '#000000',
    inputColor: '#FFFFFF',
    formBackgroundColor: '#000000',
    formInputBackgroundColor: '#333333',
    formInputBorderColor: '#00FFFF',
    formButtonBackgroundColor: '#00FFFF',
    formButtonColor: '#000000'
  }
};



function applyTheme(theme) {
  document.body.style.backgroundColor = theme.backgroundColor;
  document.body.style.color = theme.color;
  document.getElementById('prompt').style.color = theme.promptColor;
  commandLine.style.backgroundColor = theme.inputBackgroundColor;
  commandLine.style.color = theme.inputColor;
  rootUserForm.style.backgroundColor = theme.formBackgroundColor;

  const inputs = rootUserForm.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].style.backgroundColor = theme.formInputBackgroundColor;
    inputs[i].style.borderColor = theme.formInputBorderColor;
  }

  const button = rootUserForm.getElementsByTagName('button')[0];
  button.style.backgroundColor = theme.formButtonBackgroundColor;
  button.style.color = theme.formButtonColor;
}

function changeTheme(themeName) {
  const theme = themes[themeName];
  if (theme) {
    applyTheme(theme);
    localStorage.setItem('selectedTheme', themeName);
    output.innerHTML += `<div>Theme changed to ${themeName}</div>`;
  } else {
    output.innerHTML += `<div>Theme not found: ${themeName}</div>`;
  }
}

// Load saved theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(themes[savedTheme]);
  } else {
    applyTheme(themes['gruvbox']); // Apply default theme if no saved theme found
  }
});

terminal.addEventListener('click', () => {
  if (!isInputFocused) {
    commandLine.focus();
    isInputFocused = true;
  }
});

document.addEventListener('click', (event) => {
  if (event.target.id !== 'command-line' && isInputFocused) {
    commandLine.blur();
    isInputFocused = false;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Function to get random ASCII art
  function showRandomAsciiArt() {
    const asciiArtElements = document.querySelectorAll('.ascii-art, .ascii-art2');
    const randomIndex = Math.floor(Math.random() * asciiArtElements.length);
    asciiArtElements[randomIndex].style.display = 'block'; // Show the randomly selected ASCII art
  }

  // Display random ASCII art on page load
  showRandomAsciiArt();
});


function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeString = hours + ':' + minutes;
  document.getElementById('taskbar-time').textContent = timeString;
}

// update the time
updateTime();

// update the time every second made it 1 sec cause this is how i liked it
setInterval(updateTime, 1000);

//------------------------------------- DATE -------------------------------------------------------------- //

let dateDisplayTimeout;

function displayDate() {
  clearTimeout(dateDisplayTimeout);
  const currentDate = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayOfWeek = daysOfWeek[currentDate.getDay()];
  const dayOfMonth = currentDate.getDate();
  const month = monthsOfYear[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
  const dateDisplay = document.getElementById("date-display");
  dateDisplay.textContent = formattedDate;
  dateDisplay.style.display = "block";
}

function hideDate() {
  dateDisplayTimeout = setTimeout(() => {
    document.getElementById("date-display").style.display = "none";
  }, 100); // Hide after 1 second delay
}

//------------------------------------- LOCK SCREEN -------------------------------------------------------------- //

document.addEventListener("DOMContentLoaded", function () {
  const lockScreen = document.getElementById('lock-screen');
  const unlockButton = document.getElementById('unlock-button');
  const unlockMessage = document.getElementById('unlock-message');
  const taskbarLockButton = document.getElementById('taskbarLockButton');
  const passwordInput = document.getElementById('lock-password');

  unlockButton.addEventListener('click', function () {
    const password = passwordInput.value.trim();
    const rootUser = JSON.parse(localStorage.getItem('rootUser'));

    if (rootUser && password === rootUser.password) {
      // Hide lock screen
      lockScreen.style.display = 'none';
      localStorage.setItem('osLocked', 'false');
      unlockMessage.innerHTML = 'OS is unlocked!'; // Set unlock message with icon
      unlockMessage.style.display = 'block'; // Show unlock message
    } else {
      // Show incorrect password message
      unlockMessage.innerHTML = 'Incorrect password!'; // Set incorrect password message with icon
      unlockMessage.style.display = 'block'; // Show message
    }
  });

  taskbarLockButton.addEventListener('click', function () {
    // Always show the lock screen when the taskbarLockButton is clicked
    lockScreen.style.display = 'flex';
  });

  // Listen for Enter key press in the password input field
  passwordInput.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
      // Prevent the default form submission behavior
      event.preventDefault();
      // Trigger a click event on the unlock button
      unlockButton.click();
    }
  });

  // Check if OS is locked on page load
  const osLocked = localStorage.getItem('osLocked');
  if (osLocked === 'true') {
    lockScreen.style.display = 'none'; // Changed to 'none'
  } else {
    lockScreen.style.display = 'none'; // Hide lock screen on page load
  }
});

// Lock the OS and show the lock screen when the page is refreshed
window.addEventListener('beforeunload', function () {
  localStorage.setItem('osLocked', 'true');
});



//------------------------------------- HELP COMMANDS -------------------------------------------------------------- //


const categorizedCommands = {
  'Basic Commands': {
    'clear': 'Clear the terminal screen.',
    'theme [theme-name]': 'Change the terminal theme. Available themes: <b>gruvbox</b> [default], <b>dark</b>, <b>light</b>, <b>midnight</b>, <b>celestial</b>, <b>golden</b>, <b>aurora</b>, <b>kde</b>, <b>indigo</b>, <b>space</b>.',
    'neofetch': 'Display system information using neofetch.',
    'search [query]': 'Search with DuckDuckGo for the specified query.',
    'cmatrix': 'Display the "cmatrix" screensaver in the terminal.'
  },
  'File System Commands': {
    'ls': 'List files and directories in the current directory.',
    'cd [directory]': 'Change the current directory.',
    'cd ../': 'Go back to the previous directory.',
    'cat [target]': 'Display the contents of a file.',
    'open [target]': 'Open a specified target (e.g. [folder] cd github | open frostos).'
  },
  'System Commands': {
    'passwd [new-password]': 'Change the <b>ROOT</b> password.',
    'deluser': 'Delete the root user account from the system.',
    'echo [message|$SHELL]': 'Display a message or the path to the default shell.',
    'calc [expression]': 'Perform arithmetic calculations.',
    'nslookup [domain]': 'Perform a DNS lookup for a domain.',
    'reboot': 'Reboot the system.',
    'whoami': 'Display current user information.'
  },
  'Game Commands': {
    'hangman': 'Start a hangman word guessing game.',
    'guessinggame': 'Start a number guessing game.',
    'exit/clear': 'End the current game or session.'
  },
  'Music Commands': {
    'play [song]': 'Play a song.',
    'stop': 'Stop the currently playing song.',
    'pause': 'Pause the currently playing song.',
    'volume [level]': 'Adjust the volume of the currently playing song (0.0 - 1.0).'
  },
  'List of the OS songs': {
    'Breakcore songs': [
      '1. algysxx',
      '2. theendoftheworld',
      '3. dazies'
    ],
    'Jumpstyle songs': [
      '1. econyalu2008',
      '2. takingdrugs',
      '3. stylerz04'
    ],
    'Chill & Random Songs': [
      '1. handsonthewheel',
      '2. yourlove',
      '3. yng16'
    ]
  }  
};







// Implement the function to display categorized help information
function displayCategorizedHelp() {
  let helpOutput = '';

  // Loop through each category
  for (const [category, commands] of Object.entries(categorizedCommands)) {
    helpOutput += `<div><b>${category}</b></div>`;

    // Loop through each command in the category
    for (const [command, description] of Object.entries(commands)) {
      if (Array.isArray(description)) {
        // If the description is an array (list of songs), join the array elements
        helpOutput += `<div>&emsp;${command}:<br>`;
        description.forEach(song => {
          helpOutput += `&emsp;&emsp;${song}<br>`;
        });
        helpOutput += `</div>`;
      } else {
        // If it's not an array, display as usual
        helpOutput += `<div>&emsp;${command}: ${description}</div>`;
      }
    }

    // Add an empty line after each category
    helpOutput += '<br>';
  }

  output.innerHTML += helpOutput;
  terminal.scrollTop = terminal.scrollHeight;
}



function changePassword(newPassword) {
  rootUser.password = newPassword;
  localStorage.setItem('rootUser', JSON.stringify(rootUser));
  output.innerHTML += `<div>Password changed successfully!</div>`;
}




var titleTexts = [
  "⠋ FrostOS   ",
  "⠙ FrostOS   ",
  "⠹ FrostOS   ",
  "⠸ FrostOS   ",
  "⠼ FrostOS   ",
  "⠴ FrostOS   ",
  "⠦ FrostOS   ",
  "⠧ FrostOS   ",
];

var currentIndex = 0;
var lastUpdate = Date.now();
var interval = 200; // 100 milliseconds interval for smoother animation

function animateTitle() {
  var now = Date.now();
  if (now - lastUpdate >= interval) {
      document.title = titleTexts[currentIndex];
      currentIndex = (currentIndex + 1) % titleTexts.length;
      lastUpdate = now;
  }
  requestAnimationFrame(animateTitle);
}

// Start the animation
requestAnimationFrame(animateTitle);


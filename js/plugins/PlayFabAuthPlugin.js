/*:
* @plugindesc PlayFab Authentication Plugin
* @author GrantW
*
* @help
* This plugin enables PlayFab authentication in your RPG Maker MZ game.
*/

(function() {
  const script = document.createElement('script');
  script.src = 'js/playfab_auth.js';
  script.async = false;
  document.body.appendChild(script);
})();

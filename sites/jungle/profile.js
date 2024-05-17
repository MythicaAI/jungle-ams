window.onload = function() {
    var s = Snap("#profile-svg");
    Snap.load("/a/profile.svg",
        function ( loadedFragment ) {
            s.append( loadedFragment ); });
};

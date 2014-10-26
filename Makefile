# BackupFox
# Copyright © 2011 Harry O.
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

XPI_FILE_NAME := backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66@mozillafirefoxextension.xpi

all: build/$(XPI_FILE_NAME)

clean:
	@[ -d "./build/" ] && ( rm -R "./build/" && echo "Removed build directory" ) || echo "Nothing to clean"

checkenv:
	@xcf2png --version >/dev/null || ( echo " ERROR: Need to install 'xcf2png' utility or add it to your path" && false )
	@zip --version >/dev/null || ( echo " ERROR: Need to install 'zip' utility or add it to your path" && false )
	@echo "Finished environment check"


# Files in the image that will be zipped up into an XPI
IMAGE_FILES := \
	./build/image/License.txt \
	./build/image/ChangeList.txt \
	./build/image/install.rdf \
	./build/image/chrome.manifest \
	./build/image/chrome/content/about.xul \
	./build/image/chrome/content/options.xul \
	./build/image/chrome/content/overlay.js \
	./build/image/chrome/content/overlay.xul \
	./build/image/chrome/content/UTF8Coder.js \
	./build/image/chrome/locale/en-US/about.dtd \
	./build/image/chrome/locale/en-US/options.dtd \
	./build/image/chrome/locale/en-US/overlay.dtd \
	./build/image/chrome/locale/en-US/overlay.properties \
	./build/image/chrome/skin/iconA.png \
	./build/image/chrome/skin/overlay.css \
	./build/image/defaults/preferences/prefs.js \

./build/image/License.txt:                              ./License.txt
./build/image/ChangeList.txt:                           ./ChangeList.txt
./build/image/install.rdf:                              ./source/install.rdf
./build/image/chrome.manifest:                          ./source/chrome.manifest
./build/image/chrome/content/about.xul:                 ./source/chrome/content/about.xul
./build/image/chrome/content/options.xul:               ./source/chrome/content/options.xul
./build/image/chrome/content/overlay.js:                ./source/chrome/content/overlay.js
./build/image/chrome/content/overlay.xul:               ./source/chrome/content/overlay.xul
./build/image/chrome/content/UTF8Coder.js:              ./source/chrome/content/UTF8Coder.js
./build/image/chrome/locale/en-US/about.dtd:            ./source/chrome/locale/en-US/about.dtd
./build/image/chrome/locale/en-US/options.dtd:          ./source/chrome/locale/en-US/options.dtd
./build/image/chrome/locale/en-US/overlay.dtd:          ./source/chrome/locale/en-US/overlay.dtd
./build/image/chrome/locale/en-US/overlay.properties:   ./source/chrome/locale/en-US/overlay.properties
./build/image/chrome/skin/iconA.png:                    ./source/chrome/skin/iconA.xcf
./build/image/chrome/skin/overlay.css:                  ./source/chrome/skin/overlay.css
./build/image/defaults/preferences/prefs.js:            ./source/defaults/preferences/prefs.js

# PNG build rule
./build/image/%.png:
	@mkdir -p `dirname "$@"`
	@xcf2png "$<" -o "$@"
	@echo "Built \"$@\" (xcf2png)"

# default (copy) build rule
./build/image/%:
	@mkdir -p `dirname "$@"`
	@cp $< $@
	@echo "Copied \"$@\""


# Builds XPI file from image
./build/$(XPI_FILE_NAME): $(IMAGE_FILES)
	@[ -f "$@" ] && rm "$@" || true
	@(cd "./build/image/" && zip -q -r "../$(XPI_FILE_NAME)" *)
	@ls "$@" >/dev/null
	@echo "Created \"$@\""


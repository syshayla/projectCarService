/*!
* inputmask.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2017 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.11
*/

!function(factory) {
    "function" == typeof define && define.amd ? define([ "./dependencyLibs/inputmask.dependencyLib", "./global/window", "./global/document" ], factory) : "object" == typeof exports ? module.exports = factory(require("./dependencyLibs/inputmask.dependencyLib"), require("./global/window"), require("./global/document")) : window.Inputmask = factory(window.dependencyLib || jQuery, window, document);
}(function($, window, document, undefined) {
    function Inputmask(alias, options, internal) {
        if (!(this instanceof Inputmask)) return new Inputmask(alias, options, internal);
        this.el = undefined, this.events = {}, this.maskset = undefined, this.refreshValue = !1, 
        !0 !== internal && ($.isPlainObject(alias) ? options = alias : (options = options || {}).alias = alias, 
        this.opts = $.extend(!0, {}, this.defaults, options), this.noMasksCache = options && options.definitions !== undefined, 
        this.userOptions = options || {}, this.isRTL = this.opts.numericInput, resolveAlias(this.opts.alias, options, this.opts));
    }
    function resolveAlias(aliasStr, options, opts) {
        var aliasDefinition = Inputmask.prototype.aliases[aliasStr];
        return aliasDefinition ? (aliasDefinition.alias && resolveAlias(aliasDefinition.alias, undefined, opts), 
        $.extend(!0, opts, aliasDefinition), $.extend(!0, opts, options), !0) : (null === opts.mask && (opts.mask = aliasStr), 
        !1);
    }
    function generateMaskSet(opts, nocache) {
        function generateMask(mask, metadata, opts) {
            var regexMask = !1;
            if (null !== mask && "" !== mask || ((regexMask = null !== opts.regex) ? mask = (mask = opts.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (regexMask = !0, 
            mask = ".*")), 1 === mask.length && !1 === opts.greedy && 0 !== opts.repeat && (opts.placeholder = ""), 
            opts.repeat > 0 || "*" === opts.repeat || "+" === opts.repeat) {
                var repeatStart = "*" === opts.repeat ? 0 : "+" === opts.repeat ? 1 : opts.repeat;
                mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
            }
            var masksetDefinition, maskdefKey = regexMask ? "regex_" + opts.regex : opts.numericInput ? mask.split("").reverse().join("") : mask;
            return Inputmask.prototype.masksCache[maskdefKey] === undefined || !0 === nocache ? (masksetDefinition = {
                mask: mask,
                maskToken: Inputmask.prototype.analyseMask(mask, regexMask, opts),
                validPositions: {},
                _buffer: undefined,
                buffer: undefined,
                tests: {},
                metadata: metadata,
                maskLength: undefined
            }, !0 !== nocache && (Inputmask.prototype.masksCache[maskdefKey] = masksetDefinition, 
            masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]))) : masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]), 
            masksetDefinition;
        }
        if ($.isFunction(opts.mask) && (opts.mask = opts.mask(opts)), $.isArray(opts.mask)) {
            if (opts.mask.length > 1) {
                opts.keepStatic = null === opts.keepStatic || opts.keepStatic;
                var altMask = opts.groupmarker.start;
                return $.each(opts.numericInput ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                    altMask.length > 1 && (altMask += opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start), 
                    msk.mask === undefined || $.isFunction(msk.mask) ? altMask += msk : altMask += msk.mask;
                }), altMask += opts.groupmarker.end, generateMask(altMask, opts.mask, opts);
            }
            opts.mask = opts.mask.pop();
        }
        return opts.mask && opts.mask.mask !== undefined && !$.isFunction(opts.mask.mask) ? generateMask(opts.mask.mask, opts.mask, opts) : generateMask(opts.mask, opts.mask, opts);
    }
    function maskScope(actionObj, maskset, opts) {
        function getMaskTemplate(baseOnInput, minimalPos, includeMode) {
            minimalPos = minimalPos || 0;
            var ndxIntlzr, test, testPos, maskTemplate = [], pos = 0, lvp = getLastValidPosition();
            do {
                !0 === baseOnInput && getMaskSet().validPositions[pos] ? (test = (testPos = getMaskSet().validPositions[pos]).match, 
                ndxIntlzr = testPos.locator.slice(), maskTemplate.push(!0 === includeMode ? testPos.input : !1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))) : (test = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).match, 
                ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && maskTemplate.push(!1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))), 
                pos++;
            } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || minimalPos > pos);
            return "" === maskTemplate[maskTemplate.length - 1] && maskTemplate.pop(), getMaskSet().maskLength = pos + 1, 
            maskTemplate;
        }
        function getMaskSet() {
            return maskset;
        }
        function resetMaskSet(soft) {
            var maskset = getMaskSet();
            maskset.buffer = undefined, !0 !== soft && (maskset.validPositions = {}, maskset.p = 0);
        }
        function getLastValidPosition(closestTo, strict, validPositions) {
            var before = -1, after = -1, valids = validPositions || getMaskSet().validPositions;
            closestTo === undefined && (closestTo = -1);
            for (var posNdx in valids) {
                var psNdx = parseInt(posNdx);
                valids[psNdx] && (strict || !0 !== valids[psNdx].generatedInput) && (psNdx <= closestTo && (before = psNdx), 
                psNdx >= closestTo && (after = psNdx));
            }
            return -1 !== before && closestTo - before > 1 || after < closestTo ? before : after;
        }
        function stripValidPositions(start, end, nocheck, strict) {
            var i, startPos = start, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), needsValidation = !1;
            for (getMaskSet().p = start, i = end - 1; i >= startPos; i--) getMaskSet().validPositions[i] !== undefined && (!0 !== nocheck && (!getMaskSet().validPositions[i].match.optionality && function(pos) {
                var posMatch = getMaskSet().validPositions[pos];
                if (posMatch !== undefined && null === posMatch.match.fn) {
                    var prevMatch = getMaskSet().validPositions[pos - 1], nextMatch = getMaskSet().validPositions[pos + 1];
                    return prevMatch !== undefined && nextMatch !== undefined;
                }
                return !1;
            }(i) || !1 === opts.canClearPosition(getMaskSet(), i, getLastValidPosition(), strict, opts)) || delete getMaskSet().validPositions[i]);
            for (resetMaskSet(!0), i = startPos + 1; i <= getLastValidPosition(); ) {
                for (;getMaskSet().validPositions[startPos] !== undefined; ) startPos++;
                if (i < startPos && (i = startPos + 1), getMaskSet().validPositions[i] === undefined && isMask(i)) i++; else {
                    var t = getTestTemplate(i);
                    !1 === needsValidation && positionsClone[startPos] && positionsClone[startPos].match.def === t.match.def ? (getMaskSet().validPositions[startPos] = $.extend(!0, {}, positionsClone[startPos]), 
                    getMaskSet().validPositions[startPos].input = t.input, delete getMaskSet().validPositions[i], 
                    i++) : positionCanMatchDefinition(startPos, t.match.def) ? !1 !== isValid(startPos, t.input || getPlaceholder(i), !0) && (delete getMaskSet().validPositions[i], 
                    i++, needsValidation = !0) : isMask(i) || (i++, startPos--), startPos++;
                }
            }
            resetMaskSet(!0);
        }
        function determineTestTemplate(tests, guessNextBest) {
            for (var testPos, testPositions = tests, lvp = getLastValidPosition(), lvTest = getMaskSet().validPositions[lvp] || getTests(0)[0], lvTestAltArr = lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation].toString().split(",") : [], ndx = 0; ndx < testPositions.length && (!((testPos = testPositions[ndx]).match && (opts.greedy && !0 !== testPos.match.optionalQuantifier || (!1 === testPos.match.optionality || !1 === testPos.match.newBlockMarker) && !0 !== testPos.match.optionalQuantifier) && (lvTest.alternation === undefined || lvTest.alternation !== testPos.alternation || testPos.locator[lvTest.alternation] !== undefined && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr))) || !0 === guessNextBest && (null !== testPos.match.fn || /[0-9a-bA-Z]/.test(testPos.match.def))); ndx++) ;
            return testPos;
        }
        function getTestTemplate(pos, ndxIntlzr, tstPs) {
            return getMaskSet().validPositions[pos] || determineTestTemplate(getTests(pos, ndxIntlzr ? ndxIntlzr.slice() : ndxIntlzr, tstPs));
        }
        function getTest(pos) {
            return getMaskSet().validPositions[pos] ? getMaskSet().validPositions[pos] : getTests(pos)[0];
        }
        function positionCanMatchDefinition(pos, def) {
            for (var valid = !1, tests = getTests(pos), tndx = 0; tndx < tests.length; tndx++) if (tests[tndx].match && tests[tndx].match.def === def) {
                valid = !0;
                break;
            }
            return valid;
        }
        function getTests(pos, ndxIntlzr, tstPs) {
            function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                function handleMatch(match, loopNdx, quantifierRecurse) {
                    function isFirstMatch(latestMatch, tokenGroup) {
                        var firstMatch = 0 === $.inArray(latestMatch, tokenGroup.matches);
                        return firstMatch || $.each(tokenGroup.matches, function(ndx, match) {
                            if (!0 === match.isQuantifier && (firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1]))) return !1;
                        }), firstMatch;
                    }
                    function resolveNdxInitializer(pos, alternateNdx, targetAlternation) {
                        var bestMatch, indexPos;
                        if (getMaskSet().validPositions[pos - 1] && targetAlternation && getMaskSet().tests[pos]) for (var vpAlternation = getMaskSet().validPositions[pos - 1].locator, tpAlternation = getMaskSet().tests[pos][0].locator, i = 0; i < targetAlternation; i++) if (vpAlternation[i] !== tpAlternation[i]) return vpAlternation.slice(targetAlternation + 1);
                        return (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) && $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                            var alternation = targetAlternation !== undefined ? targetAlternation : lmnt.alternation, ndxPos = lmnt.locator[alternation] !== undefined ? lmnt.locator[alternation].toString().indexOf(alternateNdx) : -1;
                            (indexPos === undefined || ndxPos < indexPos) && -1 !== ndxPos && (bestMatch = lmnt, 
                            indexPos = ndxPos);
                        }), bestMatch ? bestMatch.locator.slice((targetAlternation !== undefined ? targetAlternation : bestMatch.alternation) + 1) : targetAlternation !== undefined ? resolveNdxInitializer(pos, alternateNdx) : undefined;
                    }
                    if (testPos > 1e4) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                    if (testPos === pos && match.matches === undefined) return matches.push({
                        match: match,
                        locator: loopNdx.reverse(),
                        cd: cacheDependency
                    }), !0;
                    if (match.matches !== undefined) {
                        if (match.isGroup && quantifierRecurse !== match) {
                            if (match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx)) return !0;
                        } else if (match.isOptional) {
                            var optionalToken = match;
                            if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) {
                                if (latestMatch = matches[matches.length - 1].match, !isFirstMatch(latestMatch, optionalToken)) return !0;
                                insertStop = !0, testPos = pos;
                            }
                        } else if (match.isAlternator) {
                            var maltMatches, alternateToken = match, malternateMatches = [], currentMatches = matches.slice(), loopNdxCnt = loopNdx.length, altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                            if (-1 === altIndex || "string" == typeof altIndex) {
                                var amndx, currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [];
                                if ("string" == typeof altIndex) altIndexArr = altIndex.split(","); else for (amndx = 0; amndx < alternateToken.matches.length; amndx++) altIndexArr.push(amndx);
                                for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                    if (amndx = parseInt(altIndexArr[ndx]), matches = [], ndxInitializer = resolveNdxInitializer(testPos, amndx, loopNdxCnt) || ndxInitializerClone.slice(), 
                                    !0 !== (match = handleMatch(alternateToken.matches[amndx] || maskToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse) || match) && match !== undefined && altIndexArr[altIndexArr.length - 1] < alternateToken.matches.length) {
                                        var ntndx = $.inArray(match, maskToken.matches) + 1;
                                        maskToken.matches.length > ntndx && (match = handleMatch(maskToken.matches[ntndx], [ ntndx ].concat(loopNdx.slice(1, loopNdx.length)), quantifierRecurse)) && (altIndexArr.push(ntndx.toString()), 
                                        $.each(matches, function(ndx, lmnt) {
                                            lmnt.alternation = loopNdx.length - 1;
                                        }));
                                    }
                                    maltMatches = matches.slice(), testPos = currentPos, matches = [];
                                    for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                        var altMatch = maltMatches[ndx1], dropMatch = !1;
                                        altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                        for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                            var altMatch2 = malternateMatches[ndx2];
                                            if ("string" != typeof altIndex || -1 !== $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr)) {
                                                if (function(source, target) {
                                                    return source.match.nativeDef === target.match.nativeDef || source.match.def === target.match.nativeDef || source.match.nativeDef === target.match.def;
                                                }(altMatch, altMatch2)) {
                                                    dropMatch = !0, altMatch.alternation === altMatch2.alternation && -1 === altMatch2.locator[altMatch2.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) && (altMatch2.locator[altMatch2.alternation] = altMatch2.locator[altMatch2.alternation] + "," + altMatch.locator[altMatch.alternation], 
                                                    altMatch2.alternation = altMatch.alternation), altMatch.match.nativeDef === altMatch2.match.def && (altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation], 
                                                    malternateMatches.splice(malternateMatches.indexOf(altMatch2), 1, altMatch));
                                                    break;
                                                }
                                                if (altMatch.match.def === altMatch2.match.def) {
                                                    dropMatch = !1;
                                                    break;
                                                }
                                                if (function(source, target) {
                                                    return null === source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def, getMaskSet(), pos, !1, opts, !1);
                                                }(altMatch, altMatch2) || function(source, target) {
                                                    return null !== source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def.replace(/[\[\]]/g, ""), getMaskSet(), pos, !1, opts, !1);
                                                }(altMatch, altMatch2)) {
                                                    altMatch.alternation === altMatch2.alternation && -1 === altMatch.locator[altMatch.alternation].toString().indexOf(altMatch2.locator[altMatch2.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na || altMatch.locator[altMatch.alternation].toString(), 
                                                    -1 === altMatch.na.indexOf(altMatch.locator[altMatch.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na + "," + altMatch.locator[altMatch2.alternation].toString().split("")[0]), 
                                                    dropMatch = !0, altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation].toString().split("")[0] + "," + altMatch.locator[altMatch.alternation], 
                                                    malternateMatches.splice(malternateMatches.indexOf(altMatch2), 0, altMatch));
                                                    break;
                                                }
                                            }
                                        }
                                        dropMatch || malternateMatches.push(altMatch);
                                    }
                                }
                                "string" == typeof altIndex && (malternateMatches = $.map(malternateMatches, function(lmnt, ndx) {
                                    if (isFinite(ndx)) {
                                        var alternation = lmnt.alternation, altLocArr = lmnt.locator[alternation].toString().split(",");
                                        lmnt.locator[alternation] = undefined, lmnt.alternation = undefined;
                                        for (var alndx = 0; alndx < altLocArr.length; alndx++) -1 !== $.inArray(altLocArr[alndx], altIndexArr) && (lmnt.locator[alternation] !== undefined ? (lmnt.locator[alternation] += ",", 
                                        lmnt.locator[alternation] += altLocArr[alndx]) : lmnt.locator[alternation] = parseInt(altLocArr[alndx]), 
                                        lmnt.alternation = alternation);
                                        if (lmnt.locator[alternation] !== undefined) return lmnt;
                                    }
                                })), matches = currentMatches.concat(malternateMatches), testPos = pos, insertStop = matches.length > 0, 
                                match = malternateMatches.length > 0, ndxInitializer = ndxInitializerClone.slice();
                            } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                            if (match) return !0;
                        } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) for (var qt = match, qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && testPos <= pos; qndx++) {
                            var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                            if (match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup)) {
                                if (latestMatch = matches[matches.length - 1].match, latestMatch.optionalQuantifier = qndx > qt.quantifier.min - 1, 
                                isFirstMatch(latestMatch, tokenGroup)) {
                                    if (qndx > qt.quantifier.min - 1) {
                                        insertStop = !0, testPos = pos;
                                        break;
                                    }
                                    return !0;
                                }
                                return !0;
                            }
                        } else if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) return !0;
                    } else testPos++;
                }
                for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) if (!0 !== maskToken.matches[tndx].isQuantifier) {
                    var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                    if (match && testPos === pos) return match;
                    if (testPos > pos) break;
                }
            }
            function filterTests(tests) {
                if (opts.keepStatic && pos > 0 && tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0) && !0 !== tests[0].match.optionality && !0 !== tests[0].match.optionalQuantifier && null === tests[0].match.fn && !/[0-9a-bA-Z]/.test(tests[0].match.def)) {
                    if (getMaskSet().validPositions[pos - 1] === undefined) return [ determineTestTemplate(tests) ];
                    if (getMaskSet().validPositions[pos - 1].alternation === tests[0].alternation) return [ determineTestTemplate(tests) ];
                    if (getMaskSet().validPositions[pos - 1]) return [ determineTestTemplate(tests) ];
                }
                return tests;
            }
            var latestMatch, maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr ? ndxIntlzr.slice() : [ 0 ], matches = [], insertStop = !1, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
            if (pos > -1) {
                if (ndxIntlzr === undefined) {
                    for (var test, previousPos = pos - 1; (test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) === undefined && previousPos > -1; ) previousPos--;
                    test !== undefined && previousPos > -1 && (ndxInitializer = function(tests) {
                        var locator = [];
                        return $.isArray(tests) || (tests = [ tests ]), tests.length > 0 && (tests[0].alternation === undefined ? 0 === (locator = determineTestTemplate(tests.slice()).locator.slice()).length && (locator = tests[0].locator.slice()) : $.each(tests, function(ndx, tst) {
                            if ("" !== tst.def) if (0 === locator.length) locator = tst.locator.slice(); else for (var i = 0; i < locator.length; i++) tst.locator[i] && -1 === locator[i].toString().indexOf(tst.locator[i]) && (locator[i] += "," + tst.locator[i]);
                        })), locator;
                    }(test), cacheDependency = ndxInitializer.join(""), testPos = previousPos);
                }
                if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) return filterTests(getMaskSet().tests[pos]);
                for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length && !(resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]) && testPos === pos || testPos > pos); mtndx++) ;
            }
            return (0 === matches.length || insertStop) && matches.push({
                match: {
                    fn: null,
                    cardinality: 0,
                    optionality: !0,
                    casing: null,
                    def: "",
                    placeholder: ""
                },
                locator: [],
                cd: cacheDependency
            }), ndxIntlzr !== undefined && getMaskSet().tests[pos] ? filterTests($.extend(!0, [], matches)) : (getMaskSet().tests[pos] = $.extend(!0, [], matches), 
            filterTests(getMaskSet().tests[pos]));
        }
        function getBufferTemplate() {
            return getMaskSet()._buffer === undefined && (getMaskSet()._buffer = getMaskTemplate(!1, 1), 
            getMaskSet().buffer === undefined && (getMaskSet().buffer = getMaskSet()._buffer.slice())), 
            getMaskSet()._buffer;
        }
        function getBuffer(noCache) {
            return getMaskSet().buffer !== undefined && !0 !== noCache || (getMaskSet().buffer = getMaskTemplate(!0, getLastValidPosition(), !0)), 
            getMaskSet().buffer;
        }
        function refreshFromBuffer(start, end, buffer) {
            var i, p;
            if (!0 === start) resetMaskSet(), start = 0, end = buffer.length; else for (i = start; i < end; i++) delete getMaskSet().validPositions[i];
            for (p = start, i = start; i < end; i++) if (resetMaskSet(!0), buffer[i] !== opts.skipOptionalPartCharacter) {
                var valResult = isValid(p, buffer[i], !0, !0);
                !1 !== valResult && (resetMaskSet(!0), p = valResult.caret !== undefined ? valResult.caret : valResult.pos + 1);
            }
        }
        function casing(elem, test, pos) {
            switch (opts.casing || test.casing) {
              case "upper":
                elem = elem.toUpperCase();
                break;

              case "lower":
                elem = elem.toLowerCase();
                break;

              case "title":
                var posBefore = getMaskSet().validPositions[pos - 1];
                elem = 0 === pos || posBefore && posBefore.input === String.fromCharCode(Inputmask.keyCode.SPACE) ? elem.toUpperCase() : elem.toLowerCase();
                break;

              default:
                if ($.isFunction(opts.casing)) {
                    var args = Array.prototype.slice.call(arguments);
                    args.push(getMaskSet().validPositions), elem = opts.casing.apply(this, args);
                }
            }
            return elem;
        }
        function checkAlternationMatch(altArr1, altArr2, na) {
            for (var naNdx, altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = !1, naArr = na !== undefined ? na.split(",") : [], i = 0; i < naArr.length; i++) -1 !== (naNdx = altArr1.indexOf(naArr[i])) && altArr1.splice(naNdx, 1);
            for (var alndx = 0; alndx < altArr1.length; alndx++) if (-1 !== $.inArray(altArr1[alndx], altArrC)) {
                isMatch = !0;
                break;
            }
            return isMatch;
        }
        function isValid(pos, c, strict, fromSetValid, fromAlternate, validateOnly) {
            function isSelection(posObj) {
                var selection = isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end == 1 : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin == 1;
                return selection && 0 === posObj.begin && posObj.end === getMaskSet().maskLength ? "full" : selection;
            }
            function _isValid(position, c, strict) {
                var rslt = !1;
                return $.each(getTests(position), function(ndx, tst) {
                    for (var test = tst.match, loopend = c ? 1 : 0, chrs = "", i = test.cardinality; i > loopend; i--) chrs += getBufferElement(position - (i - 1));
                    if (c && (chrs += c), getBuffer(!0), !1 !== (rslt = null != test.fn ? test.fn.test(chrs, getMaskSet(), position, strict, opts, isSelection(pos)) : (c === test.def || c === opts.skipOptionalPartCharacter) && "" !== test.def && {
                        c: getPlaceholder(position, test, !0) || test.def,
                        pos: position
                    })) {
                        var elem = rslt.c !== undefined ? rslt.c : c;
                        elem = elem === opts.skipOptionalPartCharacter && null === test.fn ? getPlaceholder(position, test, !0) || test.def : elem;
                        var validatedPos = position, possibleModifiedBuffer = getBuffer();
                        if (rslt.remove !== undefined && ($.isArray(rslt.remove) || (rslt.remove = [ rslt.remove ]), 
                        $.each(rslt.remove.sort(function(a, b) {
                            return b - a;
                        }), function(ndx, lmnt) {
                            stripValidPositions(lmnt, lmnt + 1, !0);
                        })), rslt.insert !== undefined && ($.isArray(rslt.insert) || (rslt.insert = [ rslt.insert ]), 
                        $.each(rslt.insert.sort(function(a, b) {
                            return a - b;
                        }), function(ndx, lmnt) {
                            isValid(lmnt.pos, lmnt.c, !0, fromSetValid);
                        })), rslt.refreshFromBuffer) {
                            var refresh = rslt.refreshFromBuffer;
                            if (refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, possibleModifiedBuffer), 
                            rslt.pos === undefined && rslt.c === undefined) return rslt.pos = getLastValidPosition(), 
                            !1;
                            if ((validatedPos = rslt.pos !== undefined ? rslt.pos : position) !== position) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0, fromSetValid)), 
                            !1;
                        } else if (!0 !== rslt && rslt.pos !== undefined && rslt.pos !== position && (validatedPos = rslt.pos, 
                        refreshFromBuffer(position, validatedPos, getBuffer().slice()), validatedPos !== position)) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0)), 
                        !1;
                        return (!0 === rslt || rslt.pos !== undefined || rslt.c !== undefined) && (ndx > 0 && resetMaskSet(!0), 
                        setValidPosition(validatedPos, $.extend({}, tst, {
                            input: casing(elem, test, validatedPos)
                        }), fromSetValid, isSelection(pos)) || (rslt = !1), !1);
                    }
                }), rslt;
            }
            function setValidPosition(pos, validTest, fromSetValid, isSelection) {
                if (isSelection || opts.insertMode && getMaskSet().validPositions[pos] !== undefined && fromSetValid === undefined) {
                    var i, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), lvp = getLastValidPosition(undefined, !0);
                    for (i = pos; i <= lvp; i++) delete getMaskSet().validPositions[i];
                    getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                    var j, valid = !0, vps = getMaskSet().validPositions, needsValidation = !1, initialLength = getMaskSet().maskLength;
                    for (i = j = pos; i <= lvp; i++) {
                        var t = positionsClone[i];
                        if (t !== undefined) for (var posMatch = j; posMatch < getMaskSet().maskLength && (null === t.match.fn && vps[i] && (!0 === vps[i].match.optionalQuantifier || !0 === vps[i].match.optionality) || null != t.match.fn); ) {
                            if (posMatch++, !1 === needsValidation && positionsClone[posMatch] && positionsClone[posMatch].match.def === t.match.def) getMaskSet().validPositions[posMatch] = $.extend(!0, {}, positionsClone[posMatch]), 
                            getMaskSet().validPositions[posMatch].input = t.input, fillMissingNonMask(posMatch), 
                            j = posMatch, valid = !0; else if (positionCanMatchDefinition(posMatch, t.match.def)) {
                                var result = isValid(posMatch, t.input, !0, !0);
                                valid = !1 !== result, j = result.caret || result.insert ? getLastValidPosition() : posMatch, 
                                needsValidation = !0;
                            } else if (!(valid = !0 === t.generatedInput) && posMatch >= getMaskSet().maskLength - 1) break;
                            if (getMaskSet().maskLength < initialLength && (getMaskSet().maskLength = initialLength), 
                            valid) break;
                        }
                        if (!valid) break;
                    }
                    if (!valid) return getMaskSet().validPositions = $.extend(!0, {}, positionsClone), 
                    resetMaskSet(!0), !1;
                } else getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                return resetMaskSet(!0), !0;
            }
            function fillMissingNonMask(maskPos) {
                for (var pndx = maskPos - 1; pndx > -1 && !getMaskSet().validPositions[pndx]; pndx--) ;
                var testTemplate, testsFromPos;
                for (pndx++; pndx < maskPos; pndx++) getMaskSet().validPositions[pndx] === undefined && (!1 === opts.jitMasking || opts.jitMasking > pndx) && ("" === (testsFromPos = getTests(pndx, getTestTemplate(pndx - 1).locator, pndx - 1).slice())[testsFromPos.length - 1].match.def && testsFromPos.pop(), 
                (testTemplate = determineTestTemplate(testsFromPos)) && (testTemplate.match.def === opts.radixPointDefinitionSymbol || !isMask(pndx, !0) || $.inArray(opts.radixPoint, getBuffer()) < pndx && testTemplate.match.fn && testTemplate.match.fn.test(getPlaceholder(pndx), getMaskSet(), pndx, !1, opts)) && !1 !== (result = _isValid(pndx, getPlaceholder(pndx, testTemplate.match, !0) || (null == testTemplate.match.fn ? testTemplate.match.def : "" !== getPlaceholder(pndx) ? getPlaceholder(pndx) : getBuffer()[pndx]), !0)) && (getMaskSet().validPositions[result.pos || pndx].generatedInput = !0));
            }
            strict = !0 === strict;
            var maskPos = pos;
            pos.begin !== undefined && (maskPos = isRTL && !isSelection(pos) ? pos.end : pos.begin);
            var result = !0, positionsClone = $.extend(!0, {}, getMaskSet().validPositions);
            if ($.isFunction(opts.preValidation) && !strict && !0 !== fromSetValid && !0 !== validateOnly && (result = opts.preValidation(getBuffer(), maskPos, c, isSelection(pos), opts)), 
            !0 === result) {
                if (fillMissingNonMask(maskPos), isSelection(pos) && (handleRemove(undefined, Inputmask.keyCode.DELETE, pos, !0, !0), 
                maskPos = getMaskSet().p), maskPos < getMaskSet().maskLength && (maxLength === undefined || maskPos < maxLength) && (result = _isValid(maskPos, c, strict), 
                (!strict || !0 === fromSetValid) && !1 === result && !0 !== validateOnly)) {
                    var currentPosValid = getMaskSet().validPositions[maskPos];
                    if (!currentPosValid || null !== currentPosValid.match.fn || currentPosValid.match.def !== c && c !== opts.skipOptionalPartCharacter) {
                        if ((opts.insertMode || getMaskSet().validPositions[seekNext(maskPos)] === undefined) && !isMask(maskPos, !0)) for (var nPos = maskPos + 1, snPos = seekNext(maskPos); nPos <= snPos; nPos++) if (!1 !== (result = _isValid(nPos, c, strict))) {
                            !function(originalPos, newPos) {
                                var vp = getMaskSet().validPositions[newPos];
                                if (vp) for (var targetLocator = vp.locator, tll = targetLocator.length, ps = originalPos; ps < newPos; ps++) if (getMaskSet().validPositions[ps] === undefined && !isMask(ps, !0)) {
                                    var tests = getTests(ps).slice(), bestMatch = determineTestTemplate(tests, !0), equality = -1;
                                    "" === tests[tests.length - 1].match.def && tests.pop(), $.each(tests, function(ndx, tst) {
                                        for (var i = 0; i < tll; i++) {
                                            if (tst.locator[i] === undefined || !checkAlternationMatch(tst.locator[i].toString().split(","), targetLocator[i].toString().split(","), tst.na)) {
                                                var targetAI = targetLocator[i], bestMatchAI = bestMatch.locator[i], tstAI = tst.locator[i];
                                                targetAI - bestMatchAI > Math.abs(targetAI - tstAI) && (bestMatch = tst);
                                                break;
                                            }
                                            equality < i && (equality = i, bestMatch = tst);
                                        }
                                    }), (bestMatch = $.extend({}, bestMatch, {
                                        input: getPlaceholder(ps, bestMatch.match, !0) || bestMatch.match.def
                                    })).generatedInput = !0, setValidPosition(ps, bestMatch, !0), getMaskSet().validPositions[newPos] = undefined, 
                                    _isValid(newPos, vp.input, !0);
                                }
                            }(maskPos, result.pos !== undefined ? result.pos : nPos), maskPos = nPos;
                            break;
                        }
                    } else result = {
                        caret: seekNext(maskPos)
                    };
                }
                !1 === result && opts.keepStatic && !strict && !0 !== fromAlternate && (result = function(pos, c, strict) {
                    var lastAlt, alternation, altPos, prevAltPos, i, validPos, altNdxs, decisionPos, validPsClone = $.extend(!0, {}, getMaskSet().validPositions), isValidRslt = !1, lAltPos = getLastValidPosition();
                    for (prevAltPos = getMaskSet().validPositions[lAltPos]; lAltPos >= 0; lAltPos--) if ((altPos = getMaskSet().validPositions[lAltPos]) && altPos.alternation !== undefined) {
                        if (lastAlt = lAltPos, alternation = getMaskSet().validPositions[lastAlt].alternation, 
                        prevAltPos.locator[altPos.alternation] !== altPos.locator[altPos.alternation]) break;
                        prevAltPos = altPos;
                    }
                    if (alternation !== undefined) {
                        decisionPos = parseInt(lastAlt);
                        var decisionTaker = prevAltPos.locator[prevAltPos.alternation || alternation] !== undefined ? prevAltPos.locator[prevAltPos.alternation || alternation] : altNdxs[0];
                        decisionTaker.length > 0 && (decisionTaker = decisionTaker.split(",")[0]);
                        var possibilityPos = getMaskSet().validPositions[decisionPos], prevPos = getMaskSet().validPositions[decisionPos - 1];
                        $.each(getTests(decisionPos, prevPos ? prevPos.locator : undefined, decisionPos - 1), function(ndx, test) {
                            altNdxs = test.locator[alternation] ? test.locator[alternation].toString().split(",") : [];
                            for (var mndx = 0; mndx < altNdxs.length; mndx++) {
                                var validInputs = [], staticInputsBeforePos = 0, staticInputsBeforePosAlternate = 0, verifyValidInput = !1;
                                if (decisionTaker < altNdxs[mndx] && (test.na === undefined || -1 === $.inArray(altNdxs[mndx], test.na.split(",")) || -1 === $.inArray(decisionTaker.toString(), altNdxs))) {
                                    getMaskSet().validPositions[decisionPos] = $.extend(!0, {}, test);
                                    var possibilities = getMaskSet().validPositions[decisionPos].locator;
                                    for (getMaskSet().validPositions[decisionPos].locator[alternation] = parseInt(altNdxs[mndx]), 
                                    null == test.match.fn ? (possibilityPos.input !== test.match.def && (verifyValidInput = !0, 
                                    !0 !== possibilityPos.generatedInput && validInputs.push(possibilityPos.input)), 
                                    staticInputsBeforePosAlternate++, getMaskSet().validPositions[decisionPos].generatedInput = !/[0-9a-bA-Z]/.test(test.match.def), 
                                    getMaskSet().validPositions[decisionPos].input = test.match.def) : getMaskSet().validPositions[decisionPos].input = possibilityPos.input, 
                                    i = decisionPos + 1; i < getLastValidPosition(undefined, !0) + 1; i++) (validPos = getMaskSet().validPositions[i]) && !0 !== validPos.generatedInput && /[0-9a-bA-Z]/.test(validPos.input) ? validInputs.push(validPos.input) : i < pos && staticInputsBeforePos++, 
                                    delete getMaskSet().validPositions[i];
                                    for (verifyValidInput && validInputs[0] === test.match.def && validInputs.shift(), 
                                    resetMaskSet(!0), isValidRslt = !0; validInputs.length > 0; ) {
                                        var input = validInputs.shift();
                                        if (input !== opts.skipOptionalPartCharacter && !(isValidRslt = isValid(getLastValidPosition(undefined, !0) + 1, input, !1, fromSetValid, !0))) break;
                                    }
                                    if (isValidRslt) {
                                        getMaskSet().validPositions[decisionPos].locator = possibilities;
                                        var targetLvp = getLastValidPosition(pos) + 1;
                                        for (i = decisionPos + 1; i < getLastValidPosition() + 1; i++) ((validPos = getMaskSet().validPositions[i]) === undefined || null == validPos.match.fn) && i < pos + (staticInputsBeforePosAlternate - staticInputsBeforePos) && staticInputsBeforePosAlternate++;
                                        isValidRslt = isValid((pos += staticInputsBeforePosAlternate - staticInputsBeforePos) > targetLvp ? targetLvp : pos, c, strict, fromSetValid, !0);
                                    }
                                    if (isValidRslt) return !1;
                                    resetMaskSet(), getMaskSet().validPositions = $.extend(!0, {}, validPsClone);
                                }
                            }
                        });
                    }
                    return isValidRslt;
                }(maskPos, c, strict)), !0 === result && (result = {
                    pos: maskPos
                });
            }
            if ($.isFunction(opts.postValidation) && !1 !== result && !strict && !0 !== fromSetValid && !0 !== validateOnly) {
                var postResult = opts.postValidation(getBuffer(!0), result, opts);
                if (postResult.refreshFromBuffer && postResult.buffer) {
                    var refresh = postResult.refreshFromBuffer;
                    refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, postResult.buffer);
                }
                result = !0 === postResult ? result : postResult;
            }
            return result && result.pos === undefined && (result.pos = maskPos), !1 !== result && !0 !== validateOnly || (resetMaskSet(!0), 
            getMaskSet().validPositions = $.extend(!0, {}, positionsClone)), result;
        }
        function isMask(pos, strict) {
            var test = getTestTemplate(pos).match;
            if ("" === test.def && (test = getTest(pos).match), null != test.fn) return test.fn;
            if (!0 !== strict && pos > -1) {
                var tests = getTests(pos);
                return tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0);
            }
            return !1;
        }
        function seekNext(pos, newBlock) {
            var maskL = getMaskSet().maskLength;
            if (pos >= maskL) return maskL;
            var position = pos;
            for (getTests(maskL + 1).length > 1 && (getMaskTemplate(!0, maskL + 1, !0), maskL = getMaskSet().maskLength); ++position < maskL && (!0 === newBlock && (!0 !== getTest(position).match.newBlockMarker || !isMask(position)) || !0 !== newBlock && !isMask(position)); ) ;
            return position;
        }
        function seekPrevious(pos, newBlock) {
            var tests, position = pos;
            if (position <= 0) return 0;
            for (;--position > 0 && (!0 === newBlock && !0 !== getTest(position).match.newBlockMarker || !0 !== newBlock && !isMask(position) && ((tests = getTests(position)).length < 2 || 2 === tests.length && "" === tests[1].match.def)); ) ;
            return position;
        }
        function getBufferElement(position) {
            return getMaskSet().validPositions[position] === undefined ? getPlaceholder(position) : getMaskSet().validPositions[position].input;
        }
        function writeBuffer(input, buffer, caretPos, event, triggerInputEvent) {
            if (event && $.isFunction(opts.onBeforeWrite)) {
                var result = opts.onBeforeWrite.call(inputmask, event, buffer, caretPos, opts);
                if (result) {
                    if (result.refreshFromBuffer) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer || buffer), 
                        buffer = getBuffer(!0);
                    }
                    caretPos !== undefined && (caretPos = result.caret !== undefined ? result.caret : caretPos);
                }
            }
            input !== undefined && (input.inputmask._valueSet(buffer.join("")), caretPos === undefined || event !== undefined && "blur" === event.type ? renderColorMask(input, caretPos, 0 === buffer.length) : android && event && "input" === event.type ? setTimeout(function() {
                caret(input, caretPos);
            }, 0) : caret(input, caretPos), !0 === triggerInputEvent && (skipInputEvent = !0, 
            $(input).trigger("input")));
        }
        function getPlaceholder(pos, test, returnPL) {
            if ((test = test || getTest(pos).match).placeholder !== undefined || !0 === returnPL) return $.isFunction(test.placeholder) ? test.placeholder(opts) : test.placeholder;
            if (null === test.fn) {
                if (pos > -1 && getMaskSet().validPositions[pos] === undefined) {
                    var prevTest, tests = getTests(pos), staticAlternations = [];
                    if (tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0)) for (var i = 0; i < tests.length; i++) if (!0 !== tests[i].match.optionality && !0 !== tests[i].match.optionalQuantifier && (null === tests[i].match.fn || prevTest === undefined || !1 !== tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, !0, opts)) && (staticAlternations.push(tests[i]), 
                    null === tests[i].match.fn && (prevTest = tests[i]), staticAlternations.length > 1 && /[0-9a-bA-Z]/.test(staticAlternations[0].match.def))) return opts.placeholder.charAt(pos % opts.placeholder.length);
                }
                return test.def;
            }
            return opts.placeholder.charAt(pos % opts.placeholder.length);
        }
        function checkVal(input, writeOut, strict, nptvl, initiatingEvent) {
            function isTemplateMatch(ndx, charCodes) {
                return -1 !== getBufferTemplate().slice(ndx, seekNext(ndx)).join("").indexOf(charCodes) && !isMask(ndx) && getTest(ndx).match.nativeDef === charCodes.charAt(charCodes.length - 1);
            }
            var inputValue = nptvl.slice(), charCodes = "", initialNdx = -1, result = undefined;
            if (resetMaskSet(), strict || !0 === opts.autoUnmask) initialNdx = seekNext(initialNdx); else {
                var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                matches && matches.length > 0 && (inputValue.splice(0, matches.length * staticInput.length), 
                initialNdx = seekNext(initialNdx));
            }
            if (-1 === initialNdx ? (getMaskSet().p = seekNext(initialNdx), initialNdx = 0) : getMaskSet().p = initialNdx, 
            $.each(inputValue, function(ndx, charCode) {
                if (charCode !== undefined) if (getMaskSet().validPositions[ndx] === undefined && inputValue[ndx] === getPlaceholder(ndx) && isMask(ndx, !0) && !1 === isValid(ndx, inputValue[ndx], !0, undefined, undefined, !0)) getMaskSet().p++; else {
                    var keypress = new $.Event("_checkval");
                    keypress.which = charCode.charCodeAt(0), charCodes += charCode;
                    var lvp = getLastValidPosition(undefined, !0), lvTest = getMaskSet().validPositions[lvp], nextTest = getTestTemplate(lvp + 1, lvTest ? lvTest.locator.slice() : undefined, lvp);
                    if (!isTemplateMatch(initialNdx, charCodes) || strict || opts.autoUnmask) {
                        var pos = strict ? ndx : null == nextTest.match.fn && nextTest.match.optionality && lvp + 1 < getMaskSet().p ? lvp + 1 : getMaskSet().p;
                        result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, strict, pos), 
                        initialNdx = pos + 1, charCodes = "";
                    } else result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, !0, lvp + 1);
                    if (!1 !== result && !strict && $.isFunction(opts.onBeforeWrite)) {
                        var origResult = result;
                        if (result = opts.onBeforeWrite.call(inputmask, keypress, getBuffer(), result.forwardPosition, opts), 
                        (result = $.extend(origResult, result)) && result.refreshFromBuffer) {
                            var refresh = result.refreshFromBuffer;
                            refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer), 
                            resetMaskSet(!0), result.caret && (getMaskSet().p = result.caret, result.forwardPosition = result.caret);
                        }
                    }
                }
            }), writeOut) {
                var caretPos = undefined;
                document.activeElement === input && result && (caretPos = opts.numericInput ? seekPrevious(result.forwardPosition) : result.forwardPosition), 
                writeBuffer(input, getBuffer(), caretPos, initiatingEvent || new $.Event("checkval"), initiatingEvent && "input" === initiatingEvent.type);
            }
        }
        function unmaskedvalue(input) {
            if (input) {
                if (input.inputmask === undefined) return input.value;
                input.inputmask && input.inputmask.refreshValue && EventHandlers.setValueEvent.call(input);
            }
            var umValue = [], vps = getMaskSet().validPositions;
            for (var pndx in vps) vps[pndx].match && null != vps[pndx].match.fn && umValue.push(vps[pndx].input);
            var unmaskedValue = 0 === umValue.length ? "" : (isRTL ? umValue.reverse() : umValue).join("");
            if ($.isFunction(opts.onUnMask)) {
                var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                unmaskedValue = opts.onUnMask.call(inputmask, bufferValue, unmaskedValue, opts);
            }
            return unmaskedValue;
        }
        function caret(input, begin, end, notranslate) {
            function translatePosition(pos) {
                return !0 === notranslate || !isRTL || "number" != typeof pos || opts.greedy && "" === opts.placeholder || (pos = getBuffer().join("").length - pos), 
                pos;
            }
            var range;
            if (begin === undefined) return input.setSelectionRange ? (begin = input.selectionStart, 
            end = input.selectionEnd) : window.getSelection ? (range = window.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== input && range.commonAncestorContainer !== input || (begin = range.startOffset, 
            end = range.endOffset) : document.selection && document.selection.createRange && (end = (begin = 0 - (range = document.selection.createRange()).duplicate().moveStart("character", -input.inputmask._valueGet().length)) + range.text.length), 
            {
                begin: translatePosition(begin),
                end: translatePosition(end)
            };
            if (begin.begin !== undefined && (end = begin.end, begin = begin.begin), "number" == typeof begin) {
                begin = translatePosition(begin), end = "number" == typeof (end = translatePosition(end)) ? end : begin;
                var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
                if (input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0, mobile || !1 !== opts.insertMode || begin !== end || end++, 
                input.setSelectionRange) input.selectionStart = begin, input.selectionEnd = end; else if (window.getSelection) {
                    if (range = document.createRange(), input.firstChild === undefined || null === input.firstChild) {
                        var textNode = document.createTextNode("");
                        input.appendChild(textNode);
                    }
                    range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length), 
                    range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length), 
                    range.collapse(!0);
                    var sel = window.getSelection();
                    sel.removeAllRanges(), sel.addRange(range);
                } else input.createTextRange && ((range = input.createTextRange()).collapse(!0), 
                range.moveEnd("character", end), range.moveStart("character", begin), range.select());
                renderColorMask(input, {
                    begin: begin,
                    end: end
                });
            }
        }
        function determineLastRequiredPosition(returnDefinition) {
            var pos, testPos, buffer = getBuffer(), bl = buffer.length, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = lvTest !== undefined ? lvTest.locator.slice() : undefined;
            for (pos = lvp + 1; pos < buffer.length; pos++) ndxIntlzr = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).locator.slice(), 
            positions[pos] = $.extend(!0, {}, testPos);
            var lvTestAlt = lvTest && lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation] : undefined;
            for (pos = bl - 1; pos > lvp && (((testPos = positions[pos]).match.optionality || testPos.match.optionalQuantifier && testPos.match.newBlockMarker || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && null != testPos.match.fn || null === testPos.match.fn && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && "" !== getTests(pos)[0].def)) && buffer[pos] === getPlaceholder(pos, testPos.match)); pos--) bl--;
            return returnDefinition ? {
                l: bl,
                def: positions[bl] ? positions[bl].match : undefined
            } : bl;
        }
        function clearOptionalTail(buffer) {
            for (var validPos, rl = determineLastRequiredPosition(), bl = buffer.length, lv = getMaskSet().validPositions[getLastValidPosition()]; rl < bl && !isMask(rl, !0) && (validPos = lv !== undefined ? getTestTemplate(rl, lv.locator.slice(""), lv) : getTest(rl)) && !0 !== validPos.match.optionality && (!0 !== validPos.match.optionalQuantifier && !0 !== validPos.match.newBlockMarker || rl + 1 === bl && "" === (lv !== undefined ? getTestTemplate(rl + 1, lv.locator.slice(""), lv) : getTest(rl + 1)).match.def); ) rl++;
            for (;(validPos = getMaskSet().validPositions[rl - 1]) && validPos && validPos.match.optionality && validPos.input === opts.skipOptionalPartCharacter; ) rl--;
            return buffer.splice(rl), buffer;
        }
        function isComplete(buffer) {
            if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
            if ("*" === opts.repeat) return undefined;
            var complete = !1, lrp = determineLastRequiredPosition(!0), aml = seekPrevious(lrp.l);
            if (lrp.def === undefined || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                complete = !0;
                for (var i = 0; i <= aml; i++) {
                    var test = getTestTemplate(i).match;
                    if (null !== test.fn && getMaskSet().validPositions[i] === undefined && !0 !== test.optionality && !0 !== test.optionalQuantifier || null === test.fn && buffer[i] !== getPlaceholder(i, test)) {
                        complete = !1;
                        break;
                    }
                }
            }
            return complete;
        }
        function handleRemove(input, k, pos, strict, fromIsValid) {
            if ((opts.numericInput || isRTL) && (k === Inputmask.keyCode.BACKSPACE ? k = Inputmask.keyCode.DELETE : k === Inputmask.keyCode.DELETE && (k = Inputmask.keyCode.BACKSPACE), 
            isRTL)) {
                var pend = pos.end;
                pos.end = pos.begin, pos.begin = pend;
            }
            k === Inputmask.keyCode.BACKSPACE && (pos.end - pos.begin < 1 || !1 === opts.insertMode) ? (pos.begin = seekPrevious(pos.begin), 
            getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.begin--) : k === Inputmask.keyCode.DELETE && pos.begin === pos.end && (pos.end = isMask(pos.end, !0) && getMaskSet().validPositions[pos.end] && getMaskSet().validPositions[pos.end].input !== opts.radixPoint ? pos.end + 1 : seekNext(pos.end) + 1, 
            getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.end++), 
            stripValidPositions(pos.begin, pos.end, !1, strict), !0 !== strict && function() {
                if (opts.keepStatic) {
                    for (var validInputs = [], lastAlt = getLastValidPosition(-1, !0), positionsClone = $.extend(!0, {}, getMaskSet().validPositions), prevAltPos = getMaskSet().validPositions[lastAlt]; lastAlt >= 0; lastAlt--) {
                        var altPos = getMaskSet().validPositions[lastAlt];
                        if (altPos) {
                            if (!0 !== altPos.generatedInput && /[0-9a-bA-Z]/.test(altPos.input) && validInputs.push(altPos.input), 
                            delete getMaskSet().validPositions[lastAlt], altPos.alternation !== undefined && altPos.locator[altPos.alternation] !== prevAltPos.locator[altPos.alternation]) break;
                            prevAltPos = altPos;
                        }
                    }
                    if (lastAlt > -1) for (getMaskSet().p = seekNext(getLastValidPosition(-1, !0)); validInputs.length > 0; ) {
                        var keypress = new $.Event("keypress");
                        keypress.which = validInputs.pop().charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !1, !1, getMaskSet().p);
                    } else getMaskSet().validPositions = $.extend(!0, {}, positionsClone);
                }
            }();
            var lvp = getLastValidPosition(pos.begin, !0);
            if (lvp < pos.begin) getMaskSet().p = seekNext(lvp); else if (!0 !== strict && (getMaskSet().p = pos.begin, 
            !0 !== fromIsValid)) for (;getMaskSet().p < lvp && getMaskSet().validPositions[getMaskSet().p] === undefined; ) getMaskSet().p++;
        }
        function initializeColorMask(input) {
            function findCaretPos(clientx) {
                var caretPos, e = document.createElement("span");
                for (var style in computedStyle) isNaN(style) && -1 !== style.indexOf("font") && (e.style[style] = computedStyle[style]);
                e.style.textTransform = computedStyle.textTransform, e.style.letterSpacing = computedStyle.letterSpacing, 
                e.style.position = "absolute", e.style.height = "auto", e.style.width = "auto", 
                e.style.visibility = "hidden", e.style.whiteSpace = "nowrap", document.body.appendChild(e);
                var itl, inputText = input.inputmask._valueGet(), previousWidth = 0;
                for (caretPos = 0, itl = inputText.length; caretPos <= itl; caretPos++) {
                    if (e.innerHTML += inputText.charAt(caretPos) || "_", e.offsetWidth >= clientx) {
                        var offset1 = clientx - previousWidth, offset2 = e.offsetWidth - clientx;
                        e.innerHTML = inputText.charAt(caretPos), caretPos = (offset1 -= e.offsetWidth / 3) < offset2 ? caretPos - 1 : caretPos;
                        break;
                    }
                    previousWidth = e.offsetWidth;
                }
                return document.body.removeChild(e), caretPos;
            }
            var computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null), template = document.createElement("div");
            template.style.width = computedStyle.width, template.style.textAlign = computedStyle.textAlign, 
            (colorMask = document.createElement("div")).className = "im-colormask", input.parentNode.insertBefore(colorMask, input), 
            input.parentNode.removeChild(input), colorMask.appendChild(template), colorMask.appendChild(input), 
            input.style.left = template.offsetLeft + "px", $(input).on("click", function(e) {
                return caret(input, findCaretPos(e.clientX)), EventHandlers.clickEvent.call(input, [ e ]);
            }), $(input).on("keydown", function(e) {
                e.shiftKey || !1 === opts.insertMode || setTimeout(function() {
                    renderColorMask(input);
                }, 0);
            });
        }
        function renderColorMask(input, caretPos, clear) {
            function handleStatic() {
                isStatic || null !== test.fn && testPos.input !== undefined ? isStatic && (null !== test.fn && testPos.input !== undefined || "" === test.def) && (isStatic = !1, 
                maskTemplate += "</span>") : (isStatic = !0, maskTemplate += "<span class='im-static'>");
            }
            function handleCaret(force) {
                !0 !== force && pos !== caretPos.begin || document.activeElement !== input || (maskTemplate += "<span class='im-caret' style='border-right-width: 1px;border-right-style: solid;'></span>");
            }
            var test, testPos, ndxIntlzr, maskTemplate = "", isStatic = !1, pos = 0;
            if (colorMask !== undefined) {
                var buffer = getBuffer();
                if (caretPos === undefined ? caretPos = caret(input) : caretPos.begin === undefined && (caretPos = {
                    begin: caretPos,
                    end: caretPos
                }), !0 !== clear) {
                    var lvp = getLastValidPosition();
                    do {
                        handleCaret(), getMaskSet().validPositions[pos] ? (testPos = getMaskSet().validPositions[pos], 
                        test = testPos.match, ndxIntlzr = testPos.locator.slice(), handleStatic(), maskTemplate += buffer[pos]) : (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), 
                        test = testPos.match, ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && (handleStatic(), 
                        maskTemplate += getPlaceholder(pos, test))), pos++;
                    } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || lvp > pos || isStatic);
                    -1 === maskTemplate.indexOf("im-caret") && handleCaret(!0), isStatic && handleStatic();
                }
                var template = colorMask.getElementsByTagName("div")[0];
                template.innerHTML = maskTemplate, input.inputmask.positionColorMask(input, template);
            }
        }
        maskset = maskset || this.maskset, opts = opts || this.opts;
        var undoValue, $el, maxLength, colorMask, inputmask = this, el = this.el, isRTL = this.isRTL, skipKeyPressEvent = !1, skipInputEvent = !1, ignorable = !1, mouseEnter = !1, EventRuler = {
            on: function(input, eventName, eventHandler) {
                var ev = function(e) {
                    if (this.inputmask === undefined && "FORM" !== this.nodeName) {
                        var imOpts = $.data(this, "_inputmask_opts");
                        imOpts ? new Inputmask(imOpts).mask(this) : EventRuler.off(this);
                    } else {
                        if ("setvalue" === e.type || "FORM" === this.nodeName || !(this.disabled || this.readOnly && !("keydown" === e.type && e.ctrlKey && 67 === e.keyCode || !1 === opts.tabThrough && e.keyCode === Inputmask.keyCode.TAB))) {
                            switch (e.type) {
                              case "input":
                                if (!0 === skipInputEvent) return skipInputEvent = !1, e.preventDefault();
                                break;

                              case "keydown":
                                skipKeyPressEvent = !1, skipInputEvent = !1;
                                break;

                              case "keypress":
                                if (!0 === skipKeyPressEvent) return e.preventDefault();
                                skipKeyPressEvent = !0;
                                break;

                              case "click":
                                if (iemobile || iphone) {
                                    var that = this, args = arguments;
                                    return setTimeout(function() {
                                        eventHandler.apply(that, args);
                                    }, 0), !1;
                                }
                            }
                            var returnVal = eventHandler.apply(this, arguments);
                            return !1 === returnVal && (e.preventDefault(), e.stopPropagation()), returnVal;
                        }
                        e.preventDefault();
                    }
                };
                input.inputmask.events[eventName] = input.inputmask.events[eventName] || [], input.inputmask.events[eventName].push(ev), 
                -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).on(eventName, ev) : $(input).on(eventName, ev);
            },
            off: function(input, event) {
                if (input.inputmask && input.inputmask.events) {
                    var events;
                    event ? (events = [])[event] = input.inputmask.events[event] : events = input.inputmask.events, 
                    $.each(events, function(eventName, evArr) {
                        for (;evArr.length > 0; ) {
                            var ev = evArr.pop();
                            -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).off(eventName, ev) : $(input).off(eventName, ev);
                        }
                        delete input.inputmask.events[eventName];
                    });
                }
            }
        }, EventHandlers = {
            keydownEvent: function(e) {
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
                if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || e.ctrlKey && k === Inputmask.keyCode.X && !function(eventName) {
                    var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
                    return isSupported || (el.setAttribute(evName, "return;"), isSupported = "function" == typeof el[evName]), 
                    el = null, isSupported;
                }("cut")) e.preventDefault(), handleRemove(input, k, pos), writeBuffer(input, getBuffer(!0), getMaskSet().p, e, input.inputmask._valueGet() !== getBuffer().join("")), 
                input.inputmask._valueGet() === getBufferTemplate().join("") ? $input.trigger("cleared") : !0 === isComplete(getBuffer()) && $input.trigger("complete"); else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                    e.preventDefault();
                    var caretPos = seekNext(getLastValidPosition());
                    opts.insertMode || caretPos !== getMaskSet().maskLength || e.shiftKey || caretPos--, 
                    caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, !0);
                } else k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP ? (e.preventDefault(), 
                caret(input, 0, e.shiftKey ? pos.begin : 0, !0)) : (opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || 90 === k && e.ctrlKey) && !0 !== e.altKey ? (checkVal(input, !0, !1, undoValue.split("")), 
                $input.trigger("click")) : k !== Inputmask.keyCode.INSERT || e.shiftKey || e.ctrlKey ? !0 === opts.tabThrough && k === Inputmask.keyCode.TAB ? (!0 === e.shiftKey ? (null === getTest(pos.begin).match.fn && (pos.begin = seekNext(pos.begin)), 
                pos.end = seekPrevious(pos.begin, !0), pos.begin = seekPrevious(pos.end, !0)) : (pos.begin = seekNext(pos.begin, !0), 
                pos.end = seekNext(pos.begin, !0), pos.end < getMaskSet().maskLength && pos.end--), 
                pos.begin < getMaskSet().maskLength && (e.preventDefault(), caret(input, pos.begin, pos.end))) : e.shiftKey || !1 === opts.insertMode && (k === Inputmask.keyCode.RIGHT ? setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, caretPos.begin);
                }, 0) : k === Inputmask.keyCode.LEFT && setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
                }, 0)) : (opts.insertMode = !opts.insertMode, caret(input, opts.insertMode || pos.begin !== getMaskSet().maskLength ? pos.begin : pos.begin - 1));
                opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts), ignorable = -1 !== $.inArray(k, opts.ignorables);
            },
            keypressEvent: function(e, checkval, writeOut, strict, ndx) {
                var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
                if (!(!0 === checkval || e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) return k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("") && (undoValue = getBuffer().join(""), 
                setTimeout(function() {
                    $input.trigger("change");
                }, 0)), !0;
                if (k) {
                    46 === k && !1 === e.shiftKey && "" !== opts.radixPoint && (k = opts.radixPoint.charCodeAt(0));
                    var forwardPosition, pos = checkval ? {
                        begin: ndx,
                        end: ndx
                    } : caret(input), c = String.fromCharCode(k);
                    getMaskSet().writeOutBuffer = !0;
                    var valResult = isValid(pos, c, strict);
                    if (!1 !== valResult && (resetMaskSet(!0), forwardPosition = valResult.caret !== undefined ? valResult.caret : checkval ? valResult.pos + 1 : seekNext(valResult.pos), 
                    getMaskSet().p = forwardPosition), !1 !== writeOut && (setTimeout(function() {
                        opts.onKeyValidation.call(input, k, valResult, opts);
                    }, 0), getMaskSet().writeOutBuffer && !1 !== valResult)) {
                        var buffer = getBuffer();
                        writeBuffer(input, buffer, opts.numericInput && valResult.caret === undefined ? seekPrevious(forwardPosition) : forwardPosition, e, !0 !== checkval), 
                        !0 !== checkval && setTimeout(function() {
                            !0 === isComplete(buffer) && $input.trigger("complete");
                        }, 0);
                    }
                    if (e.preventDefault(), checkval) return !1 !== valResult && (valResult.forwardPosition = forwardPosition), 
                    valResult;
                }
            },
            pasteEvent: function(e) {
                var tempValue, input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(!0), caretPos = caret(input);
                isRTL && (tempValue = caretPos.end, caretPos.end = caretPos.begin, caretPos.begin = tempValue);
                var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
                if (valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("") && (valueBeforeCaret = ""), 
                valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("") && (valueAfterCaret = ""), 
                isRTL && (tempValue = valueBeforeCaret, valueBeforeCaret = valueAfterCaret, valueAfterCaret = tempValue), 
                window.clipboardData && window.clipboardData.getData) inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret; else {
                    if (!ev.clipboardData || !ev.clipboardData.getData) return !0;
                    inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret;
                }
                var pasteValue = inputValue;
                if ($.isFunction(opts.onBeforePaste)) {
                    if (!1 === (pasteValue = opts.onBeforePaste.call(inputmask, inputValue, opts))) return e.preventDefault();
                    pasteValue || (pasteValue = inputValue);
                }
                return checkVal(input, !1, !1, isRTL ? pasteValue.split("").reverse() : pasteValue.toString().split("")), 
                writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, undoValue !== getBuffer().join("")), 
                !0 === isComplete(getBuffer()) && $input.trigger("complete"), e.preventDefault();
            },
            inputFallBackEvent: function(e) {
                var input = this, inputValue = input.inputmask._valueGet();
                if (getBuffer().join("") !== inputValue) {
                    var caretPos = caret(input);
                    if (!1 === function(input, inputValue, caretPos) {
                        if ("." === inputValue.charAt(caretPos.begin - 1) && "" !== opts.radixPoint && ((inputValue = inputValue.split(""))[caretPos.begin - 1] = opts.radixPoint.charAt(0), 
                        inputValue = inputValue.join("")), inputValue.charAt(caretPos.begin - 1) === opts.radixPoint && inputValue.length > getBuffer().length) {
                            var keypress = new $.Event("keypress");
                            return keypress.which = opts.radixPoint.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, caretPos.begin - 1), 
                            !1;
                        }
                    }(input, inputValue, caretPos)) return !1;
                    if (inputValue = inputValue.replace(new RegExp("(" + Inputmask.escapeRegex(getBufferTemplate().join("")) + ")*"), ""), 
                    !1 === function(input, inputValue, caretPos) {
                        if (iemobile) {
                            var inputChar = inputValue.replace(getBuffer().join(""), "");
                            if (1 === inputChar.length) {
                                var keypress = new $.Event("keypress");
                                return keypress.which = inputChar.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, getMaskSet().validPositions[caretPos.begin - 1] ? caretPos.begin : caretPos.begin - 1), 
                                !1;
                            }
                        }
                    }(input, inputValue, caretPos)) return !1;
                    caretPos.begin > inputValue.length && (caret(input, inputValue.length), caretPos = caret(input));
                    var buffer = getBuffer().join(""), frontPart = inputValue.substr(0, caretPos.begin), backPart = inputValue.substr(caretPos.begin), frontBufferPart = buffer.substr(0, caretPos.begin), backBufferPart = buffer.substr(caretPos.begin), selection = caretPos, entries = "", isEntry = !1;
                    if (frontPart !== frontBufferPart) {
                        selection.begin = 0;
                        for (var fpl = (isEntry = frontPart.length >= frontBufferPart.length) ? frontPart.length : frontBufferPart.length, i = 0; frontPart.charAt(i) === frontBufferPart.charAt(i) && i < fpl; i++) selection.begin++;
                        isEntry && (entries += frontPart.slice(selection.begin, selection.end));
                    }
                    backPart !== backBufferPart && (backPart.length > backBufferPart.length ? isEntry && (selection.end = selection.begin) : backPart.length < backBufferPart.length ? selection.end += backBufferPart.length - backPart.length : backPart.charAt(0) !== backBufferPart.charAt(0) && selection.end++), 
                    writeBuffer(input, getBuffer(), selection), entries.length > 0 ? $.each(entries.split(""), function(ndx, entry) {
                        var keypress = new $.Event("keypress");
                        keypress.which = entry.charCodeAt(0), ignorable = !1, EventHandlers.keypressEvent.call(input, keypress);
                    }) : (selection.begin === selection.end - 1 && caret(input, seekPrevious(selection.begin + 1), selection.end), 
                    e.keyCode = Inputmask.keyCode.DELETE, EventHandlers.keydownEvent.call(input, e)), 
                    e.preventDefault();
                }
            },
            setValueEvent: function(e) {
                this.inputmask.refreshValue = !1;
                var input = this, value = input.inputmask._valueGet(!0);
                $.isFunction(opts.onBeforeMask) && (value = opts.onBeforeMask.call(inputmask, value, opts) || value), 
                value = value.split(""), checkVal(input, !0, !1, isRTL ? value.reverse() : value), 
                undoValue = getBuffer().join(""), (opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("") && input.inputmask._valueSet("");
            },
            focusEvent: function(e) {
                var input = this, nptValue = input.inputmask._valueGet();
                opts.showMaskOnFocus && (!opts.showMaskOnHover || opts.showMaskOnHover && "" === nptValue) && (input.inputmask._valueGet() !== getBuffer().join("") ? writeBuffer(input, getBuffer(), seekNext(getLastValidPosition())) : !1 === mouseEnter && caret(input, seekNext(getLastValidPosition()))), 
                !0 === opts.positionCaretOnTab && !1 === mouseEnter && "" !== nptValue && (writeBuffer(input, getBuffer(), caret(input)), 
                EventHandlers.clickEvent.apply(input, [ e, !0 ])), undoValue = getBuffer().join("");
            },
            mouseleaveEvent: function(e) {
                var input = this;
                if (mouseEnter = !1, opts.clearMaskOnLostFocus && document.activeElement !== input) {
                    var buffer = getBuffer().slice(), nptValue = input.inputmask._valueGet();
                    nptValue !== input.getAttribute("placeholder") && "" !== nptValue && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer), 
                    writeBuffer(input, buffer));
                }
            },
            clickEvent: function(e, tabbed) {
                function doRadixFocus(clickPos) {
                    if ("" !== opts.radixPoint) {
                        var vps = getMaskSet().validPositions;
                        if (vps[clickPos] === undefined || vps[clickPos].input === getPlaceholder(clickPos)) {
                            if (clickPos < seekNext(-1)) return !0;
                            var radixPos = $.inArray(opts.radixPoint, getBuffer());
                            if (-1 !== radixPos) {
                                for (var vp in vps) if (radixPos < vp && vps[vp].input !== getPlaceholder(vp)) return !1;
                                return !0;
                            }
                        }
                    }
                    return !1;
                }
                var input = this;
                setTimeout(function() {
                    if (document.activeElement === input) {
                        var selectedCaret = caret(input);
                        if (tabbed && (isRTL ? selectedCaret.end = selectedCaret.begin : selectedCaret.begin = selectedCaret.end), 
                        selectedCaret.begin === selectedCaret.end) switch (opts.positionCaretOnClick) {
                          case "none":
                            break;

                          case "radixFocus":
                            if (doRadixFocus(selectedCaret.begin)) {
                                var radixPos = getBuffer().join("").indexOf(opts.radixPoint);
                                caret(input, opts.numericInput ? seekNext(radixPos) : radixPos);
                                break;
                            }

                          default:
                            var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, !0), lastPosition = seekNext(lvclickPosition);
                            if (clickPosition < lastPosition) caret(input, isMask(clickPosition, !0) || isMask(clickPosition - 1, !0) ? clickPosition : seekNext(clickPosition)); else {
                                var lvp = getMaskSet().validPositions[lvclickPosition], tt = getTestTemplate(lastPosition, lvp ? lvp.match.locator : undefined, lvp), placeholder = getPlaceholder(lastPosition, tt.match);
                                if ("" !== placeholder && getBuffer()[lastPosition] !== placeholder && !0 !== tt.match.optionalQuantifier && !0 !== tt.match.newBlockMarker || !isMask(lastPosition, !0) && tt.match.def === placeholder) {
                                    var newPos = seekNext(lastPosition);
                                    (clickPosition >= newPos || clickPosition === lastPosition) && (lastPosition = newPos);
                                }
                                caret(input, lastPosition);
                            }
                        }
                    }
                }, 0);
            },
            dblclickEvent: function(e) {
                var input = this;
                setTimeout(function() {
                    caret(input, 0, seekNext(getLastValidPosition()));
                }, 0);
            },
            cutEvent: function(e) {
                var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e, clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
                clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join("")), 
                document.execCommand && document.execCommand("copy"), handleRemove(input, Inputmask.keyCode.DELETE, pos), 
                writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")), 
                input.inputmask._valueGet() === getBufferTemplate().join("") && $input.trigger("cleared");
            },
            blurEvent: function(e) {
                var $input = $(this), input = this;
                if (input.inputmask) {
                    var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                    "" !== nptValue && (opts.clearMaskOnLostFocus && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer)), 
                    !1 === isComplete(buffer) && (setTimeout(function() {
                        $input.trigger("incomplete");
                    }, 0), opts.clearIncomplete && (resetMaskSet(), buffer = opts.clearMaskOnLostFocus ? [] : getBufferTemplate().slice())), 
                    writeBuffer(input, buffer, undefined, e)), undoValue !== getBuffer().join("") && (undoValue = buffer.join(""), 
                    $input.trigger("change"));
                }
            },
            mouseenterEvent: function(e) {
                var input = this;
                mouseEnter = !0, document.activeElement !== input && opts.showMaskOnHover && input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer());
            },
            submitEvent: function(e) {
                undoValue !== getBuffer().join("") && $el.trigger("change"), opts.clearMaskOnLostFocus && -1 === getLastValidPosition() && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("") && el.inputmask._valueSet(""), 
                opts.removeMaskOnSubmit && (el.inputmask._valueSet(el.inputmask.unmaskedvalue(), !0), 
                setTimeout(function() {
                    writeBuffer(el, getBuffer());
                }, 0));
            },
            resetEvent: function(e) {
                el.inputmask.refreshValue = !0, setTimeout(function() {
                    $el.trigger("setvalue");
                }, 0);
            }
        };
        Inputmask.prototype.positionColorMask = function(input, template) {
            input.style.left = template.offsetLeft + "px";
        };
        var valueBuffer;
        if (actionObj !== undefined) switch (actionObj.action) {
          case "isComplete":
            return el = actionObj.el, isComplete(getBuffer());

          case "unmaskedvalue":
            return el !== undefined && actionObj.value === undefined || (valueBuffer = actionObj.value, 
            valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, valueBuffer, opts) || valueBuffer : valueBuffer).split(""), 
            checkVal(undefined, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite.call(inputmask, undefined, getBuffer(), 0, opts)), 
            unmaskedvalue(el);

          case "mask":
            !function(elem) {
                EventRuler.off(elem);
                var isSupported = function(input, opts) {
                    var elementType = input.getAttribute("type"), isSupported = "INPUT" === input.tagName && -1 !== $.inArray(elementType, opts.supportsInputType) || input.isContentEditable || "TEXTAREA" === input.tagName;
                    if (!isSupported) if ("INPUT" === input.tagName) {
                        var el = document.createElement("input");
                        el.setAttribute("type", elementType), isSupported = "text" === el.type, el = null;
                    } else isSupported = "partial";
                    return !1 !== isSupported ? function(npt) {
                        function getter() {
                            return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== getLastValidPosition() || !0 !== opts.nullable ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "" : valueGet.call(this);
                        }
                        function setter(value) {
                            valueSet.call(this, value), this.inputmask && $(this).trigger("setvalue");
                        }
                        var valueGet, valueSet;
                        if (!npt.inputmask.__valueGet) {
                            if (!0 !== opts.noValuePatching) {
                                if (Object.getOwnPropertyDescriptor) {
                                    "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" == typeof "test".__proto__ ? function(object) {
                                        return object.__proto__;
                                    } : function(object) {
                                        return object.constructor.prototype;
                                    });
                                    var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : undefined;
                                    valueProperty && valueProperty.get && valueProperty.set ? (valueGet = valueProperty.get, 
                                    valueSet = valueProperty.set, Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: !0
                                    })) : "INPUT" !== npt.tagName && (valueGet = function() {
                                        return this.textContent;
                                    }, valueSet = function(value) {
                                        this.textContent = value;
                                    }, Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: !0
                                    }));
                                } else document.__lookupGetter__ && npt.__lookupGetter__("value") && (valueGet = npt.__lookupGetter__("value"), 
                                valueSet = npt.__lookupSetter__("value"), npt.__defineGetter__("value", getter), 
                                npt.__defineSetter__("value", setter));
                                npt.inputmask.__valueGet = valueGet, npt.inputmask.__valueSet = valueSet;
                            }
                            npt.inputmask._valueGet = function(overruleRTL) {
                                return isRTL && !0 !== overruleRTL ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                            }, npt.inputmask._valueSet = function(value, overruleRTL) {
                                valueSet.call(this.el, null === value || value === undefined ? "" : !0 !== overruleRTL && isRTL ? value.split("").reverse().join("") : value);
                            }, valueGet === undefined && (valueGet = function() {
                                return this.value;
                            }, valueSet = function(value) {
                                this.value = value;
                            }, function(type) {
                                if ($.valHooks && ($.valHooks[type] === undefined || !0 !== $.valHooks[type].inputmaskpatch)) {
                                    var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                                        return elem.value;
                                    }, valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                                        return elem.value = value, elem;
                                    };
                                    $.valHooks[type] = {
                                        get: function(elem) {
                                            if (elem.inputmask) {
                                                if (elem.inputmask.opts.autoUnmask) return elem.inputmask.unmaskedvalue();
                                                var result = valhookGet(elem);
                                                return -1 !== getLastValidPosition(undefined, undefined, elem.inputmask.maskset.validPositions) || !0 !== opts.nullable ? result : "";
                                            }
                                            return valhookGet(elem);
                                        },
                                        set: function(elem, value) {
                                            var result, $elem = $(elem);
                                            return result = valhookSet(elem, value), elem.inputmask && $elem.trigger("setvalue"), 
                                            result;
                                        },
                                        inputmaskpatch: !0
                                    };
                                }
                            }(npt.type), function(npt) {
                                EventRuler.on(npt, "mouseenter", function(event) {
                                    var $input = $(this);
                                    this.inputmask._valueGet() !== getBuffer().join("") && $input.trigger("setvalue");
                                });
                            }(npt));
                        }
                    }(input) : input.inputmask = undefined, isSupported;
                }(elem, opts);
                if (!1 !== isSupported && (el = elem, $el = $(el), -1 === (maxLength = el !== undefined ? el.maxLength : undefined) && (maxLength = undefined), 
                !0 === opts.colorMask && initializeColorMask(el), android && (el.hasOwnProperty("inputmode") && (el.inputmode = opts.inputmode, 
                el.setAttribute("inputmode", opts.inputmode)), "rtfm" === opts.androidHack && (!0 !== opts.colorMask && initializeColorMask(el), 
                el.type = "password")), !0 === isSupported && (EventRuler.on(el, "submit", EventHandlers.submitEvent), 
                EventRuler.on(el, "reset", EventHandlers.resetEvent), EventRuler.on(el, "mouseenter", EventHandlers.mouseenterEvent), 
                EventRuler.on(el, "blur", EventHandlers.blurEvent), EventRuler.on(el, "focus", EventHandlers.focusEvent), 
                EventRuler.on(el, "mouseleave", EventHandlers.mouseleaveEvent), !0 !== opts.colorMask && EventRuler.on(el, "click", EventHandlers.clickEvent), 
                EventRuler.on(el, "dblclick", EventHandlers.dblclickEvent), EventRuler.on(el, "paste", EventHandlers.pasteEvent), 
                EventRuler.on(el, "dragdrop", EventHandlers.pasteEvent), EventRuler.on(el, "drop", EventHandlers.pasteEvent), 
                EventRuler.on(el, "cut", EventHandlers.cutEvent), EventRuler.on(el, "complete", opts.oncomplete), 
                EventRuler.on(el, "incomplete", opts.onincomplete), EventRuler.on(el, "cleared", opts.oncleared), 
                android || !0 === opts.inputEventOnly ? el.removeAttribute("maxLength") : (EventRuler.on(el, "keydown", EventHandlers.keydownEvent), 
                EventRuler.on(el, "keypress", EventHandlers.keypressEvent)), EventRuler.on(el, "compositionstart", $.noop), 
                EventRuler.on(el, "compositionupdate", $.noop), EventRuler.on(el, "compositionend", $.noop), 
                EventRuler.on(el, "keyup", $.noop), EventRuler.on(el, "input", EventHandlers.inputFallBackEvent), 
                EventRuler.on(el, "beforeinput", $.noop)), EventRuler.on(el, "setvalue", EventHandlers.setValueEvent), 
                undoValue = getBufferTemplate().join(""), "" !== el.inputmask._valueGet(!0) || !1 === opts.clearMaskOnLostFocus || document.activeElement === el)) {
                    var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, el.inputmask._valueGet(!0), opts) || el.inputmask._valueGet(!0) : el.inputmask._valueGet(!0);
                    "" !== initialValue && checkVal(el, !0, !1, isRTL ? initialValue.split("").reverse() : initialValue.split(""));
                    var buffer = getBuffer().slice();
                    undoValue = buffer.join(""), !1 === isComplete(buffer) && opts.clearIncomplete && resetMaskSet(), 
                    opts.clearMaskOnLostFocus && document.activeElement !== el && (-1 === getLastValidPosition() ? buffer = [] : clearOptionalTail(buffer)), 
                    writeBuffer(el, buffer), document.activeElement === el && caret(el, seekNext(getLastValidPosition()));
                }
            }(el);
            break;

          case "format":
            return valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, actionObj.value, opts) || actionObj.value : actionObj.value).split(""), 
            checkVal(undefined, !0, !1, isRTL ? valueBuffer.reverse() : valueBuffer), actionObj.metadata ? {
                value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                metadata: maskScope.call(this, {
                    action: "getmetadata"
                }, maskset, opts)
            } : isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

          case "isValid":
            actionObj.value ? (valueBuffer = actionObj.value.split(""), checkVal(undefined, !0, !0, isRTL ? valueBuffer.reverse() : valueBuffer)) : actionObj.value = getBuffer().join("");
            for (var buffer = getBuffer(), rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), isComplete(buffer) && actionObj.value === getBuffer().join("");

          case "getemptymask":
            return getBufferTemplate().join("");

          case "remove":
            if (el && el.inputmask) {
                $el = $(el), el.inputmask._valueSet(opts.autoUnmask ? unmaskedvalue(el) : el.inputmask._valueGet(!0)), 
                EventRuler.off(el);
                Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value") && el.inputmask.__valueGet && Object.defineProperty(el, "value", {
                    get: el.inputmask.__valueGet,
                    set: el.inputmask.__valueSet,
                    configurable: !0
                }) : document.__lookupGetter__ && el.__lookupGetter__("value") && el.inputmask.__valueGet && (el.__defineGetter__("value", el.inputmask.__valueGet), 
                el.__defineSetter__("value", el.inputmask.__valueSet)), el.inputmask = undefined;
            }
            return el;

          case "getmetadata":
            if ($.isArray(maskset.metadata)) {
                var maskTarget = getMaskTemplate(!0, 0, !1).join("");
                return $.each(maskset.metadata, function(ndx, mtdt) {
                    if (mtdt.mask === maskTarget) return maskTarget = mtdt, !1;
                }), maskTarget;
            }
            return maskset.metadata;
        }
    }
    var ua = navigator.userAgent, mobile = /mobile/i.test(ua), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile, android = /android/i.test(ua) && !iemobile;
    return Inputmask.prototype = {
        dataAttribute: "data-inputmask",
        defaults: {
            placeholder: "_",
            optionalmarker: {
                start: "[",
                end: "]"
            },
            quantifiermarker: {
                start: "{",
                end: "}"
            },
            groupmarker: {
                start: "(",
                end: ")"
            },
            alternatormarker: "|",
            escapeChar: "\\",
            mask: null,
            regex: null,
            oncomplete: $.noop,
            onincomplete: $.noop,
            oncleared: $.noop,
            repeat: 0,
            greedy: !0,
            autoUnmask: !1,
            removeMaskOnSubmit: !1,
            clearMaskOnLostFocus: !0,
            insertMode: !0,
            clearIncomplete: !1,
            alias: null,
            onKeyDown: $.noop,
            onBeforeMask: null,
            onBeforePaste: function(pastedValue, opts) {
                return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(this, pastedValue, opts) : pastedValue;
            },
            onBeforeWrite: null,
            onUnMask: null,
            showMaskOnFocus: !0,
            showMaskOnHover: !0,
            onKeyValidation: $.noop,
            skipOptionalPartCharacter: " ",
            numericInput: !1,
            rightAlign: !1,
            undoOnEscape: !0,
            radixPoint: "",
            radixPointDefinitionSymbol: undefined,
            groupSeparator: "",
            keepStatic: null,
            positionCaretOnTab: !0,
            tabThrough: !1,
            supportsInputType: [ "text", "tel", "password" ],
            ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 0, 229 ],
            isComplete: null,
            canClearPosition: $.noop,
            preValidation: null,
            postValidation: null,
            staticDefinitionSymbol: undefined,
            jitMasking: !1,
            nullable: !0,
            inputEventOnly: !1,
            noValuePatching: !1,
            positionCaretOnClick: "lvp",
            casing: null,
            inputmode: "verbatim",
            colorMask: !1,
            androidHack: !1,
            importDataAttributes: !0
        },
        definitions: {
            "9": {
                validator: "[0-9ï¼‘-ï¼™]",
                cardinality: 1,
                definitionSymbol: "*"
            },
            a: {
                validator: "[A-Za-zĞ-ÑĞÑ‘Ã€-Ã¿Âµ]",
                cardinality: 1,
                definitionSymbol: "*"
            },
            "*": {
                validator: "[0-9ï¼‘-ï¼™A-Za-zĞ-ÑĞÑ‘Ã€-Ã¿Âµ]",
                cardinality: 1
            }
        },
        aliases: {},
        masksCache: {},
        mask: function(elems) {
            function importAttributeOptions(npt, opts, userOptions, dataAttribute) {
                function importOption(option, optionData) {
                    null !== (optionData = optionData !== undefined ? optionData : npt.getAttribute(dataAttribute + "-" + option)) && ("string" == typeof optionData && (0 === option.indexOf("on") ? optionData = window[optionData] : "false" === optionData ? optionData = !1 : "true" === optionData && (optionData = !0)), 
                    userOptions[option] = optionData);
                }
                if (!0 === opts.importDataAttributes) {
                    var option, dataoptions, optionData, p, attrOptions = npt.getAttribute(dataAttribute);
                    if (attrOptions && "" !== attrOptions && (attrOptions = attrOptions.replace(new RegExp("'", "g"), '"'), 
                    dataoptions = JSON.parse("{" + attrOptions + "}")), dataoptions) {
                        optionData = undefined;
                        for (p in dataoptions) if ("alias" === p.toLowerCase()) {
                            optionData = dataoptions[p];
                            break;
                        }
                    }
                    importOption("alias", optionData), userOptions.alias && resolveAlias(userOptions.alias, userOptions, opts);
                    for (option in opts) {
                        if (dataoptions) {
                            optionData = undefined;
                            for (p in dataoptions) if (p.toLowerCase() === option.toLowerCase()) {
                                optionData = dataoptions[p];
                                break;
                            }
                        }
                        importOption(option, optionData);
                    }
                }
                return $.extend(!0, opts, userOptions), ("rtl" === npt.dir || opts.rightAlign) && (npt.style.textAlign = "right"), 
                ("rtl" === npt.dir || opts.numericInput) && (npt.dir = "ltr", npt.removeAttribute("dir"), 
                opts.isRTL = !0), opts;
            }
            var that = this;
            return "string" == typeof elems && (elems = document.getElementById(elems) || document.querySelectorAll(elems)), 
            elems = elems.nodeName ? [ elems ] : elems, $.each(elems, function(ndx, el) {
                var scopedOpts = $.extend(!0, {}, that.opts);
                importAttributeOptions(el, scopedOpts, $.extend(!0, {}, that.userOptions), that.dataAttribute);
                var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                maskset !== undefined && (el.inputmask !== undefined && (el.inputmask.opts.autoUnmask = !0, 
                el.inputmask.remove()), el.inputmask = new Inputmask(undefined, undefined, !0), 
                el.inputmask.opts = scopedOpts, el.inputmask.noMasksCache = that.noMasksCache, el.inputmask.userOptions = $.extend(!0, {}, that.userOptions), 
                el.inputmask.isRTL = scopedOpts.isRTL || scopedOpts.numericInput, el.inputmask.el = el, 
                el.inputmask.maskset = maskset, $.data(el, "_inputmask_opts", scopedOpts), maskScope.call(el.inputmask, {
                    action: "mask"
                }));
            }), elems && elems[0] ? elems[0].inputmask || this : this;
        },
        option: function(options, noremask) {
            return "string" == typeof options ? this.opts[options] : "object" == typeof options ? ($.extend(this.userOptions, options), 
            this.el && !0 !== noremask && this.mask(this.el), this) : void 0;
        },
        unmaskedvalue: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "unmaskedvalue",
                value: value
            });
        },
        remove: function() {
            return maskScope.call(this, {
                action: "remove"
            });
        },
        getemptymask: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "getemptymask"
            });
        },
        hasMaskedValue: function() {
            return !this.opts.autoUnmask;
        },
        isComplete: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "isComplete"
            });
        },
        getmetadata: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "getmetadata"
            });
        },
        isValid: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "isValid",
                value: value
            });
        },
        format: function(value, metadata) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
            maskScope.call(this, {
                action: "format",
                value: value,
                metadata: metadata
            });
        },
        analyseMask: function(mask, regexMask, opts) {
            function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                this.matches = [], this.openGroup = isGroup || !1, this.alternatorGroup = !1, this.isGroup = isGroup || !1, 
                this.isOptional = isOptional || !1, this.isQuantifier = isQuantifier || !1, this.isAlternator = isAlternator || !1, 
                this.quantifier = {
                    min: 1,
                    max: 1
                };
            }
            function insertTestDefinition(mtoken, element, position) {
                position = position !== undefined ? position : mtoken.matches.length;
                var prevMatch = mtoken.matches[position - 1];
                if (regexMask) 0 === element.indexOf("[") || escaped && /\\d|\\s|\\w]/i.test(element) || "." === element ? mtoken.matches.splice(position++, 0, {
                    fn: new RegExp(element, opts.casing ? "i" : ""),
                    cardinality: 1,
                    optionality: mtoken.isOptional,
                    newBlockMarker: prevMatch === undefined || prevMatch.def !== element,
                    casing: null,
                    def: element,
                    placeholder: undefined,
                    nativeDef: element
                }) : (escaped && (element = element[element.length - 1]), $.each(element.split(""), function(ndx, lmnt) {
                    prevMatch = mtoken.matches[position - 1], mtoken.matches.splice(position++, 0, {
                        fn: null,
                        cardinality: 0,
                        optionality: mtoken.isOptional,
                        newBlockMarker: prevMatch === undefined || prevMatch.def !== lmnt && null !== prevMatch.fn,
                        casing: null,
                        def: opts.staticDefinitionSymbol || lmnt,
                        placeholder: opts.staticDefinitionSymbol !== undefined ? lmnt : undefined,
                        nativeDef: lmnt
                    });
                })), escaped = !1; else {
                    var maskdef = (opts.definitions ? opts.definitions[element] : undefined) || Inputmask.prototype.definitions[element];
                    if (maskdef && !escaped) {
                        for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                            var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                            mtoken.matches.splice(position++, 0, {
                                fn: validator ? "string" == typeof validator ? new RegExp(validator, opts.casing ? "i" : "") : new function() {
                                    this.test = validator;
                                }() : new RegExp("."),
                                cardinality: cardinality || 1,
                                optionality: mtoken.isOptional,
                                newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                                casing: maskdef.casing,
                                def: maskdef.definitionSymbol || element,
                                placeholder: maskdef.placeholder,
                                nativeDef: element
                            }), prevMatch = mtoken.matches[position - 1];
                        }
                        mtoken.matches.splice(position++, 0, {
                            fn: maskdef.validator ? "string" == typeof maskdef.validator ? new RegExp(maskdef.validator, opts.casing ? "i" : "") : new function() {
                                this.test = maskdef.validator;
                            }() : new RegExp("."),
                            cardinality: maskdef.cardinality,
                            optionality: mtoken.isOptional,
                            newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                            casing: maskdef.casing,
                            def: maskdef.definitionSymbol || element,
                            placeholder: maskdef.placeholder,
                            nativeDef: element
                        });
                    } else mtoken.matches.splice(position++, 0, {
                        fn: null,
                        cardinality: 0,
                        optionality: mtoken.isOptional,
                        newBlockMarker: prevMatch === undefined || prevMatch.def !== element && null !== prevMatch.fn,
                        casing: null,
                        def: opts.staticDefinitionSymbol || element,
                        placeholder: opts.staticDefinitionSymbol !== undefined ? element : undefined,
                        nativeDef: element
                    }), escaped = !1;
                }
            }
            function verifyGroupMarker(maskToken) {
                maskToken && maskToken.matches && $.each(maskToken.matches, function(ndx, token) {
                    var nextToken = maskToken.matches[ndx + 1];
                    (nextToken === undefined || nextToken.matches === undefined || !1 === nextToken.isQuantifier) && token && token.isGroup && (token.isGroup = !1, 
                    regexMask || (insertTestDefinition(token, opts.groupmarker.start, 0), !0 !== token.openGroup && insertTestDefinition(token, opts.groupmarker.end))), 
                    verifyGroupMarker(token);
                });
            }
            function defaultCase() {
                if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], insertTestDefinition(currentOpeningToken, m), 
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                    }
                } else insertTestDefinition(currentToken, m);
            }
            function reverseTokens(maskToken) {
                maskToken.matches = maskToken.matches.reverse();
                for (var match in maskToken.matches) if (maskToken.matches.hasOwnProperty(match)) {
                    var intMatch = parseInt(match);
                    if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                        var qt = maskToken.matches[match];
                        maskToken.matches.splice(match, 1), maskToken.matches.splice(intMatch + 1, 0, qt);
                    }
                    maskToken.matches[match].matches !== undefined ? maskToken.matches[match] = reverseTokens(maskToken.matches[match]) : maskToken.matches[match] = function(st) {
                        return st === opts.optionalmarker.start ? st = opts.optionalmarker.end : st === opts.optionalmarker.end ? st = opts.optionalmarker.start : st === opts.groupmarker.start ? st = opts.groupmarker.end : st === opts.groupmarker.end && (st = opts.groupmarker.start), 
                        st;
                    }(maskToken.matches[match]);
                }
                return maskToken;
            }
            var match, m, openingToken, currentOpeningToken, alternator, lastMatch, groupToken, tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, regexTokenizer = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, escaped = !1, currentToken = new MaskToken(), openenings = [], maskTokens = [];
            for (regexMask && (opts.optionalmarker.start = undefined, opts.optionalmarker.end = undefined); match = regexMask ? regexTokenizer.exec(mask) : tokenizer.exec(mask); ) {
                if (m = match[0], regexMask) switch (m.charAt(0)) {
                  case "?":
                    m = "{0,1}";
                    break;

                  case "+":
                  case "*":
                    m = "{" + m + "}";
                }
                if (escaped) defaultCase(); else switch (m.charAt(0)) {
                  case opts.escapeChar:
                    escaped = !0, regexMask && defaultCase();
                    break;

                  case opts.optionalmarker.end:
                  case opts.groupmarker.end:
                    if (openingToken = openenings.pop(), openingToken.openGroup = !1, openingToken !== undefined) if (openenings.length > 0) {
                        if ((currentOpeningToken = openenings[openenings.length - 1]).matches.push(openingToken), 
                        currentOpeningToken.isAlternator) {
                            alternator = openenings.pop();
                            for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1, 
                            alternator.matches[mndx].alternatorGroup = !1;
                            openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                        }
                    } else currentToken.matches.push(openingToken); else defaultCase();
                    break;

                  case opts.optionalmarker.start:
                    openenings.push(new MaskToken(!1, !0));
                    break;

                  case opts.groupmarker.start:
                    openenings.push(new MaskToken(!0));
                    break;

                  case opts.quantifiermarker.start:
                    var quantifier = new MaskToken(!1, !1, !0), mq = (m = m.replace(/[{}]/g, "")).split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                    if ("*" !== mq1 && "+" !== mq1 || (mq0 = "*" === mq1 ? 0 : 1), quantifier.quantifier = {
                        min: mq0,
                        max: mq1
                    }, openenings.length > 0) {
                        var matches = openenings[openenings.length - 1].matches;
                        (match = matches.pop()).isGroup || ((groupToken = new MaskToken(!0)).matches.push(match), 
                        match = groupToken), matches.push(match), matches.push(quantifier);
                    } else (match = currentToken.matches.pop()).isGroup || (regexMask && null === match.fn && "." === match.def && (match.fn = new RegExp(match.def, opts.casing ? "i" : "")), 
                    (groupToken = new MaskToken(!0)).matches.push(match), match = groupToken), currentToken.matches.push(match), 
                    currentToken.matches.push(quantifier);
                    break;

                  case opts.alternatormarker:
                    if (openenings.length > 0) {
                        var subToken = (currentOpeningToken = openenings[openenings.length - 1]).matches[currentOpeningToken.matches.length - 1];
                        lastMatch = currentOpeningToken.openGroup && (subToken.matches === undefined || !1 === subToken.isGroup && !1 === subToken.isAlternator) ? openenings.pop() : currentOpeningToken.matches.pop();
                    } else lastMatch = currentToken.matches.pop();
                    if (lastMatch.isAlternator) openenings.push(lastMatch); else if (lastMatch.alternatorGroup ? (alternator = openenings.pop(), 
                    lastMatch.alternatorGroup = !1) : alternator = new MaskToken(!1, !1, !1, !0), alternator.matches.push(lastMatch), 
                    openenings.push(alternator), lastMatch.openGroup) {
                        lastMatch.openGroup = !1;
                        var alternatorGroup = new MaskToken(!0);
                        alternatorGroup.alternatorGroup = !0, openenings.push(alternatorGroup);
                    }
                    break;

                  default:
                    defaultCase();
                }
            }
            for (;openenings.length > 0; ) openingToken = openenings.pop(), currentToken.matches.push(openingToken);
            return currentToken.matches.length > 0 && (verifyGroupMarker(currentToken), maskTokens.push(currentToken)), 
            (opts.numericInput || opts.isRTL) && reverseTokens(maskTokens[0]), maskTokens;
        }
    }, Inputmask.extendDefaults = function(options) {
        $.extend(!0, Inputmask.prototype.defaults, options);
    }, Inputmask.extendDefinitions = function(definition) {
        $.extend(!0, Inputmask.prototype.definitions, definition);
    }, Inputmask.extendAliases = function(alias) {
        $.extend(!0, Inputmask.prototype.aliases, alias);
    }, Inputmask.format = function(value, options, metadata) {
        return Inputmask(options).format(value, metadata);
    }, Inputmask.unmask = function(value, options) {
        return Inputmask(options).unmaskedvalue(value);
    }, Inputmask.isValid = function(value, options) {
        return Inputmask(options).isValid(value);
    }, Inputmask.remove = function(elems) {
        $.each(elems, function(ndx, el) {
            el.inputmask && el.inputmask.remove();
        });
    }, Inputmask.escapeRegex = function(str) {
        var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
        return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
    }, Inputmask.keyCode = {
        ALT: 18,
        BACKSPACE: 8,
        BACKSPACE_SAFARI: 127,
        CAPS_LOCK: 20,
        COMMA: 188,
        COMMAND: 91,
        COMMAND_LEFT: 91,
        COMMAND_RIGHT: 93,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        MENU: 93,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        WINDOWS: 91,
        X: 88
    }, Inputmask;
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   =BA^º—,îEL,¢c;œÕ!Ù®÷p–'8ï3Ñ î	j„ü~»úË­OõÎ³jC¨˜0»õxÛ†nĞ›W9Õfms‘-QßÅ=i‡9Ê+G<%øğÿœß7x{i²¡ó´m^`2m^‰;YÙß9/O¾ş_?ãybóSßáëÄ±ºzç“Ğ×x£Õ¾'ab«ËÿİWù¥~ßp•Á):Rªû“‹±o|Ä"†ß(,ìj¤æp±Å˜”k„‹›¯ğªıyxé¯©¸bl³¸ø-ìÒÊ]ãÌ¢•-ŸGî¸¦üı“x:ÖØÌ>}‚îjòš;ÏíoéJ˜ˆÍ¦ví-ÒµÏ¢VsŠÈ{3¿F?ÙåŞ¹
/3I¶=‡äqhnÇpé^+Ú&É“
ÛDÅQVvØÇÍ=¾àõtô¼C}'•6µÃjİ½Iğ>Ë_;5Dï¡™st¬zªqék×V#5Şìæïôó¸?BF®í1l•uùeÂÈ©îüı‰ÌÛ§1_¤&6ÔÏª|TïèÅÈ8gÿo)ÿâ`~Õİë_É%Ó»½®Ù"¢f¼½Ò¼STÒèóüi2™K}Xdwz;Œ‚X1ß)ÄËX€¯væ–%6÷êIyñ…ruTLù*l³¦U*’]hÜĞ›;YpVÀW‘ÛëLäöÉ$F$Ş<üºÖ–hÄUÆãh›·$$ûĞ•\×ŸÏdÁFÊ~]dˆğÚOÿü«,Ílëâ^ì_Õ”‹¨Í…¬èt>ày¾Ÿan7„öQu¶À5>¢€«r6@ì¾Èá®ØD²[yğŞÂóô=»+i;zùµònŠÔbÚæóÕ5ä¦¦›í¢¤µ3#àE—AşÿT!Y£8~<^Mû16ğ&@"Ñ–Z—Ipˆ½BøOc·˜¥‹K-òü¯Áy¦†ëÛ8„ŒŞ?í—{öx5dD@Ns<]²ôöÕŒF??D²QşXÖ±™üµü>îk0ßõ›·Kš#¹^G}Š¯>¦Èàæ±-ãĞmgÆlÒ†_? àyO’yF—:¼ˆ6¥¸²¡«ÜY¹¦{Î»gSµç7¿„·¢ò8Ã&}¦Î¿7”4UMc>>¤şuµİÀJÑÁy(‹ïZßòN]íèÍÉ
~€à‹„?äbîS€@»Ë…m
Û[­kã@¬×İ†¼AÅû}Œ¦¯	€(Ñ‚ëîá1fÖæçæ‚“ÿvPejåXÂú¯?ŸLK¯ffÂ9bêˆ;†’¥&•sGçÛêz=ø-".Zo÷IÎöÎˆØıDr4‚|¯(&†„z^Š)µ(&`ğJ¹Ï#×ŒL$˜OdèÆæmw*¬cmq’˜bšö½OKô;×–ÎŠI_ÿw‡ªĞÂu<ª	XÒT¸«×Pş3bğÊDêO9k™V`X“Ò?‘ßxfÆêC¬%uN?Ü~¾ÃğmÃ¨ß–ó 3Ÿ#Àa¬+)“èpXH2'uŸcs…ìjv1ò!Ì×XúÜõ£/şÍ(+ÍöëÁW{öæÇ0Ú?K{4Eè'…ãjÚÖáÄ6‰(FèCW˜ë0å¢İÛØŞEŸÂÇ* Ú–z>ZDLëÉ%Å1|÷Öfkû	C“æ´cdPˆò<*“ÅOv…u¬°ò;›QW0øØÍŒõxÃ×)Í¯X»X”SX>†–€ºš¶u* c3vmqÒŠ FPİgb`èªgx=¶b£r$®OÛ„Ì`ü7C Ùğša)ƒØŒëM øŞëûÓ-ºïµªİ9šBS)ÛóYj^Æ‡#04fömááMë±ï).¼Ç5M2éõpÖÏµêà[ÒvNÎÂ¦qŠsæ¸'h|ÿË†Ğâ"’%‹{ñlèä¨Áğ+OÃå##Ò¯ƒËÓ;ÛtmóêtÃò«•7É/Í0ğêú>)é}&ºUïlË+\¼JøìÑÑèÃâÖlüÙGqY'çã0%:¿†Vf˜5›«ßFc÷h¾`KË#éyƒ79ÚÅ$M`êú¶.‘Ê±0ÉôÃ„Jı² ZÔHlíóC¡q†&jÎ]šàsL âã&‚=W2|â0Ò”5TÓÈ³nó~Eµı°4ÁÀÛ$ k¨ÿ2(÷aìG»Ì|qı‡¯æ‘Ì{Ï{ mÌHVµ4Áöà 3É0ÕC®ƒfSé²ÁàÊ;ÂÒ¨ÿ oıRçú ÑgúŒ…›ß<+ù„ïEãuÛÃ=ü.9S;Ì„8L–öØ|2>Òšö®ZcÇ•Ò=aÙÀò«	—¡d³}÷ê×T}¶˜Da›*ÁM—²$‘¬á–ĞP4Gö¿
*™=Yÿ»š÷¡İËXìd«öÍ“ımRLá9<<Ù9işÎ>Ã¨mc<«’Àßs©@Ü±´Ø·fş;”f:ó”ô¿)ãŒ¦›ÆÂZV°(mmHIû³ŸD­:i.V—Ä·Ïgm3r'âà1b£¿AÑ|2#áûØœB7F"J= ×z©e”lÿ¼•çŞşôœì.X³íïıqğ¥Í“¤ ,İ:Ã»nq–ç{§î¯\OPEÇ0(wßÅb¡²ú˜·®ëwx•–í1-gú¿°3…}Óêéƒ3<ıÊ-ôiùè«şê²Ÿß¶šb(¶b;üÿ¢e÷¥şeÅ°ùÁ3¡öŒ\¤Éî ş¼ñÍ×Ã™s:a­Ï?Ôê ÿ=J×ĞÉå®h¢ÁÜë–—Ç÷Š^<Óÿx!™¾Ûºàİ5yÆÎò‡%ò%^]^«E´^+ñ6¤£N<q©_9X¹±İ5˜J}û¼Ìd}úëê˜Z°7‚˜åûó£õ¼-¾§_ßHJ°~¢oéÇĞæä¤Líís[ÊíR ¸æ&sĞÈª[«wÆÚ*Fö.™‘œPÈ	µÖİzSÙ±b9¤%MR—SÀe·#]ú—ä¿—nì­uåIÛş€Kó·+>˜JZ§/õ£aëP€5aè²¤*â?˜˜Œ€³çÆqù‹‘»¢· ‘p/ó'ş¨Õè‡ev|6ÖËÉ<Ñöê@ãT®™"BË‹‡ ëû,»¦‹"]#±5×ÍƒF\%KÍ#5ÒÊç¿‘Oßbdô¬·hk4t_ÿe’FTF	ìme5ŒĞ{’•á¹ÆäÊ>ƒä­ËÔ}º‹ºÒZŸıˆù=ÎK¸;û±¾¬§Ï4ıeõ‹Ë‘ÌÑ›y¦²a~gø}gs¢Ñü»r`ó/ìš|åÛ{GÓö/Æ‡™ñ2y;7ŒŞ‰•İÃsY¹Ğ#«)9kÍÏ+Ùš?»5DÑÿ·s ıàÆ:Üêbõµ9û{=õ«ÙõÍø!İ¢¢²‰İrTÛ°÷¸"!$¶ÀS•Ä €ya­Êi­ví´rÄ‹ f‰¯q¿¾nd/Y%ÿaZSÇ"íË¯å„Rï£ÁÚAO.³³‚ÑŠOÁOÔ¦m¿3[ü‰i[ i-$ÏÚWAs…kË€BÏuãò<¾qÕK1ZIr¿Ñf­E7rµæ¶à4ŸBHåˆYŠ¢Û?NÉë†~ãs­•'ü…Ëé§‰¡l Â[·S«b,2ÈG·É{ù¢¾®;w4¢o6ÇYÚÚ¦Å„?Î>N+2\ğú2é‚ä÷-<ô(ş	¥ôšy
Ñ«Â,û"Å†}ú?¬p”ãéz°"W¹;˜1ÙQ9]×d!ğwS#“;ríYÅÄìÚ¤3£Ûl_ÆÖÃ»Ñ¼éÜÏe½ı÷| r sş¾®kLœ/ıÇód¦ÓÔó'w«Oü…]yö\ íÈi¹ğ×G<?
“½ão?-l%Ã¤ï#Š‹YÒ¶çİEb5ìMT{È’@“‡…ß¹)¥ÓKZé3‘æp±ÚèW’n’u„è÷Ğ’±®[rÒ¼¼œsi!€g‡kˆÕ¸úCWM2&×|âÑÎŞqSõˆLzQ\ù×üÌ¢Ww%wª«Îi¿øÌ@oj?ĞÎ>#¥Áiş(ïUaq#     €  0OS/2"ş   ¼   `cmapUÍ¶     Lgasp     h   glyfy¶Yû  p 'Thead iåı (Ä   6hheaã< (ü   $hmtxÁ'T )   loca±¦ .°  Êmaxp’½ 1|    nameU­â 1œ  9post    2Ø         Lf   GLf   õ  „                               @  ç_àÿàÿàà                                   8   
      ç_ÿıÿÿ      æ ÿıÿÿ ÿã              ÿÿ             79               79               79     ÿó à   #'#5'#53'75373 cFFşÀAccFFDEcIFFccş¿AFFccED   =ÿëãÚ  & = T  ";#7'#".=4>;752>54.#52#7#52>54.#52l	5«ª6ÂAC<		y!,!!,!-
	A	«ï­cş¤€Aû	
<+!!!!,   ÿà à W ¹  .'5>7>7>.'<6&5&>7>&'.'&"5%5%>?5'./.'.1'&4&4=4>7>7>7630' 4G*
$	+H5 ş 1?%						$>0ş@8, +				

' ,9+ P		
	Q!+   <ÿßÄá  G `  %'5.54>67%.=4>%54.''4>664.'&7>=¦
şÔ

!,,!)77)	şÔ,–B@JÔ
Ö	;+""+8((8=	ÖÔ   ÿßŞ½ ' ] b g l q  7>.>7#".'.677>2"&'.46?'32>?>4&'."735#7'77''7@*#()	*		:[ 

['('Ğ{{;;00š—–EN	N	

#()W[  &)'[')'(""ØRR/WW  iÿşµÑ   8 = B  .#"#!5#'2#>33+".53;2>5#533#53I
lLl:4y
Ò
Ò—Z£

KşÃ

=şÃ=ññññ      ÿï à 2 k € • ª º  %2>'6.#".#"3:62332>73'#"./""#".7&>327>32#"./"32>'6.#".7&>32#"32>'6.#64>32"&7Z"=,,="(&1&&1

	6
((		&1&&1
6		
		
r		¯*7 8)
!.-"(	#"

",,!3



[



% ÿÿÿàá   A  %#.'5##335>7355#.'35#>735#3>0@$$?/>>/?$$@0>ó3(;;(35(;;(5ï$?1>>0?$$?0==1?$´<<(44(::(44(   –ÿıˆÂ   " 7  7''7'32>'6.#"72#".'>3wyy{]]Y[[‘
		
6		ÂWş’TTnWşu??%ABşÜô		     ÿàâà  - F K P  %.54>6%.54>%'4.%%>5%%Ë	ş		p	şpş–Lş´şğ+		‡ş[
§
ş[§ş³KşÔşò    ÿìõ¿ 
   #'#7'7'7'373õ»::»—:˜˜:——^^$_u$$u_$²²o²nn²oÒEEoEooEo  <ÿàÆà  % 4 9 > G  "#;2>5#.#2#>3+".53#35#537'7'7Ä 	µ		†
iµÓ<ZZ•^´´^†	şÄ		<	ş¥şâÓZZ<    ÿşâÛ  0 G ^ u Œ  4.''75'5>54>7'.5'.54>7.54>7%'>54.'7'>54.'7Z!!<–<–				<		L



l		:



h  ôò		7
0	
  ÿşÿş ¤  ) > S ] b g  7"32>54.#".54>32#%"32>54.#".54>32#!!?35#!'!'!!S				 				@	şt!gSmş¤eşµTşÎh		L		L		L		ˆ<òà0[µyy ÿşÿş Â  ) > S ] b k t  7"32>54.#".54>32#%"32>54.#".54>32#!!?35#!'!'#53353'#53#5#S				 				@	şt!g Sm'şÎe!ñµÓñµh		L		L		L		ˆ<òá/şğµµwYYwÔ;:      ÿá á  ) *  "32>54.#".54>32#764645<&4/.'7.'./"."#*#'7223:62?>7>7'>?#'0*#*1/./.'7'./<5<5?>?'>77>?0:3:17 				şN&

H				H

&NN&

H				H

&NfDD$JJ$DD:J,x						H

&NN&

H				G

'NN'

H		5$::$DD$;;$6     ÿíôá ! ;  %'>54.#"32>77%".54>7>32#ôœ5H(&# 5G)# œşĞ"=- "<--<"œ #)G5 $%(H5œu,=" -=""<-   ÿìôà ! ; H  %'>54.#"32>77%".54>7>32#73##5#5353ôœ5H(&# 5G)# œşĞ"=- "<--<"<<==œ #)G5 #&(H5œv-<" -=""<-´<<==      ÿíôá ! ; @  %'>54.#"32>77%".54>7>32#'3#5ôœ5H(&# 5G)# œşĞ"=- "<--<"L——œ #)G5 $%(H5œu,=" -=""<-µ     ÿàâ® < Q f  %"'7''.#"32>7.'732>7.#".'>32#!".7&>32#ˆG½º¼»E	
"" DB	"  şñ				•JÇÆÆÇJ!!!	GG	!!!—







     —ÿàià  %  3##535#535#535#535#535#535#535#53—ÒÒ´–<<<<<<<<–àş  şş<   ÿİÄà   # . 3 T  #"7.#32#'>373##/33'33##737#737#737#737#737#737#737#73‡<	MI::YY[<  yÒÔ¶˜;=;=;=;=–à	ş¿••A	kşã?ÀÃÃÀ?¦ş  şş<    ÿà à  %  	'77'77'77'77'77'77'77'7'jş––j–şÁ++**+**+kşÁkàş––j–ş–*++*+**+kşÁk  kÿğˆÂ    7!'3kşãşqoàÂş.cbÑşhMMzş†     ÿşâà     %#7'53'%!3#!#53.¶[[˜z==Lş<<ˆy—±/şÑ==8ÙÙ**Ùş<Äşxˆ      ÿó Í  7  7#53>32.#"33#".'32>735#µµ,;H'(I<,	'5?#$C5&–&5C$#?5'	,<I('H;,µïµ|$=,.@&!8(+<##<+(8!&@.,=$|µ  ÿşâÂ   %##5#53533âÓÓÓÓÑÓÓÓÓ    —ÿşiÂ  , 9  4.#"35>5".54>32#7#4.#52i&&!"i-	X''#óò#K<
  % Ô´     -  '."7>&'7'?'?'7'7>2Ô*şğ5Ÿşˆ9:'¥@¦?º>@?)Š*şïŸ5şÆ;:S¦@¥?»@@?*   ÿàşÓ    # 7 B  '.?>54.'7'?'?'7'7>21ñ*ã4ãş·::&x?x?@@@+şâÄ¦¨*ä4ä
	şó<;Tw>y@@?A+şãÅşy   ÿàâà 4 9 >  5!#";2#35#54.+".=4>;!535##53!5!Äşx

µZ	µˆµ—ş´L¤<<
Z	-ÓÓ-	Z[[şZ——Kyy    ÿï à 3 N \ m „ ™  %.#81"32>?3%4>7>3812.5#"./37!'.54>?#'32>54.'".54>7#÷şõ
C‘				¨lşYm	~mõnŒşÏÉÃ1$~

	¸C				’§½mş±ooÈÄ#;		k

    ÿïñÑ  % 6  "32>54.#2.54>3".'# 2XA&&AX22XA&&AX2%# ş×!:L,%# )!:L,Ñ&AX22XA&&AX22XA&ş× #%,L:!şZ) #%,L:!  Zÿà¦à  ' , ; P  #";2>76.#32!7&>3!'!#".'7!#'#".7&>32xñ	ï	ññşïşñïhà	şZ		¦	--Zññş–KK-  < ÑÄ ï   %!5!Äşxˆï  iÿï—à . = c s  "75>?>7>54.#'532>77"#"&/".#.54>32'''7'7537 7)JL)7-.,&&&&	
!,,!
		7#!!"59;à)6 
Ù99Ù
 6)şL""Æ	,!!,	„:77:99    iÿï—à . = c x  "75>?>7>54.#'532>77"#"&/".#.54>32'#".54>32 7)JL)7-.,&&&&	
!,,!
					à)6 
Ù99Ù
 6)şL""Æ	,!!,	W

  —ÿàià ( 7 >  #.+"3753732354.##32#5<1#'53A	
K78
	ŒKZ2
(Z(Â

şF)FU€€eişf2ÑÑ2      â¶ 7 > R  '464656./.#"777>'6.''?7'74>#Ø6	şñ%XZ[şÈ?¨AªÀAK6H5		5şğY
[[	ñ@©@©¿@J4G     #ÿşİÈ 	  %'#'7È¹¹İİÕ¹şp¹İİ   Ù¾ 	  %'75'7Ùİ¹ş¹İáİººÜ    ' â¾ 	  %!'7!âş¹İİ¹Ò¹Şİ¹  #ÿøİÂ 	  %'737İİİ¹¹Õİİ¹şp¹  <ÿßÃá  < J f  %'5.54>67%.=4>=4>7%54.&4.55&7>=¥	şÓ

)77)	şÅğ!,,!şÒ-–B@JÔ
Ö	; 6**6 ;
.=-  -=,ÖÔ     ;ÿüä¥  	  ?%;Ÿ%äşX©a‹¥şWå%ŸªŠ `   [ÿß‡¤ 3 i  '7>4&'."267#".'.46?>27>2"&'.46?'32>?>4&'."‡Z
Z')'Ñ[  
[')'Z')'Z')'![  &)'[')'   ÿà à  	    !!!!#35!!  ş şñÄ——ş<Äş<àş  µşÓ-şÓ-şÓKyy      ÿş Â  	   !!!!7!53!#53ˆşxˆşµK—şxK=[ÂşµKşÓşñ´şµ[=     ÿş Â  	    !!!5!!53!5#537!53!5#53KşµKşñyş´<Zşµ<ÂşññÓÓy<Òşğµşñ<Ó    ÿÿÓ˜ $ 9  7'7'.'7>54.'77'7.54>6¾4ö  !544şº				"5õ ""	œ364şú		     ÿà Ã 	 &  %'777'.='7>=' ’nn’âşZ	¦	D‘nFş¼l“ÄÂÄ
Â    ÿşâÂ  	    !!!5!%!!%'''77Äş<¦şxˆşxˆşxpI/Kf‚N(_Âş<ÄşZ<<[-şÓ7G2„•½‹+\      ÿğ Ì , Z  ".#"7>?4646'6.#./4&6&7&>323'>32x#!	%1&KQ?
DQL
$3f
:H@@C>(&&(Ì%1	1eR69Td.	1% %SK;8JU(	''''  ÿ÷ÿğ	Ì W p   .4&7&>32>32'>57&6&6'6.#"#.#"./.'74>7'7''7777'$3#!	%1&(&&(ú"(/81
"0:-+!
¬VUVU_KWTWTM]#	1%%1		
	''''		
	şó'1$;,,;#1'ë====C6<<<<6C  >ÿà¦à  .=4>7>=4.&44.=404=4.'405'.=40454.&405.5544.'"./.'1223.=./.67>7>54>6234>626666267¦"cc
			
[Û		
	Ûtz)ˆ•’‹«%ÔÒ
	
	…
		  /ÿàËà#  #".=4>7>?46.'*"*&'&"&'.574.'""#*#".5'4.#"0""&'.5'4.'."&#""./.2#".=./.67>7>'&>7>7254>32>7>306243>2Ë$#	/jj		
		
		=ó
	òd ¸Ç Ö;··		
¥				
	
  ^ÿş¥£  #".=4>7>=4.#""1#".=4.#"#".51581504.#"001#".515.#"81#".="&"&"017:#".=./.467>72625820=4>32>32>32626232¥4	3

		7°	66	°	@==NQe!p5'n7
	
    ÿà ¤     '#!!'3%535!ñ;¶ şñH;şş<‹‹Äş<h<ş<ˆ==yşxñğ  "ÿàÄà     %/7#3ˆşšfôô[³‹‹,__¾ş      -ÿàÄà  
   #3!!7'!!5ÄşjZş¥XW;ÿ AA àş  ñwz\X´     ÿàÄà      #33##535#5#35'335#ÄşÒñ–Óx=<[—´µàş  ñ<ñ<ñ—µÓ—µ      'ÿ{  3 H ] r ‡  %.#"32>7464&5".'>32#5"32>54.#".54>32#5"32>54.#".54>32#ÿ3CO++OC33CO++OC3ÿ%F;--;F%%F;--;F%((((Ö%=++=%$=++=$‘%3 4%%4 3%ú((((¾y		4    ÿà Ø 	 &  '7'##!".7'#3!2>7'#ƒ“‘oo`şY
¥
-––qş»Eq]ÃÃÃ		Ã     ÿáíß 	    75#'7'31#'#5'7µn“’n2nn’“ÔÔn’’n+nÖÖn’’     ÿş Â  	 " ; @  7!5!7!!5%!"3!2>54.##!".54>3!23#5<ˆşxLş´yşZ		¦		şZ¦şµÒÒ•ññÓµµZ	şÎ		2	ş£2şÎI   ÿà à L d p ˆ  #<=!#32>?#35#5>732>7>7>="&'.'.53'".'!#7"&/>73 DşˆD	YÓ\
şx	'ˆ3>!<"=2Ü	&Â!E;,=<
,;E!şØ0C)

!HFCCPq}-5mJü)C0:DN-

  ÿûÿşŞ     ''!'!!%!'77|{‡4¢4‰şÎtş”tş„fxthÉÉsşvŠsù<æW¾¾Xç    ÿÜ à 8 T p  +532>=4.#!";75#".=4>3!2+'#".=4>;2#4.+";532>= 	şZ-6h		¦	Z	n		—	—%E-³ğ
ğğW/[|
ğ		ò\	\\	\		\::\    ÿİ à  7  !";7!2>54.##!5#".54>3!2ÓşZ		
		şëd-¦à	şÓ
{{
-	ş¦XX-şÓ    ÿİ à  7 < A F  !";7!2>54.##!5#".54>3!2!!5!!53#5ÓşZ		
		şëd-¦şxLş´Lş´µµà	şÓ
{{
-	ş¦XX-şÓ =<    # İ½   %''7'77ÈÈÈÈÈÈÈÈàÈÈÈÈÈÈÈÈ    —ÿşjÃ N  '54.'>=4."'"54>65'.=4>6j	
		'(`ÿ şó+å

	
šœÃ-$$     díf   %''7íØÖîìz××íí  ŒÿôÍ   %'7'7í××íáí××ì  rÿôtÍ   7'7×íí×á×íì×    [í\   '77ííí××GííÖÖ     2 Ğ»   	'7Ğşö”z÷«şj„nz  ÿşÉÙ 
   3!3#!''¦şZıßjşìgåÑM2şÌ¦ş–Gg[şÄN      ¤  " 7 G  5##!!!5332>54.'3'#".54>32'.#"#5!#³W\ ş³/ş<Æ!+,!/<!!!!ŞÄH†ş–jş´Ó,!!,Ó—!!!!Z==     	  D U b  #"54.+";2>=32>7;2>54.#".5<645#%#5%#53%53ğ:şµ	+		+	&"_:şò’ şy‡y		
&YşŠH(€,şÄ    ÿşß»   2  '#*1#7>32#4.#"30:32>5ßÄÃĞ	¥‰		AJªşâş‘
g
1      ÿà à   ( - 2  757757'%'%5'57>6%7.&%%575ÓZ-ş<m
 &,,'
mşà	!!	4şxˆş<ÄX-/<¶´ğ##ğğ	
ò˜–Ô´¶     ‡ ¯£    #3%#77#733¯×G3=Xb\'22‹b=£Ó¶ò—µxx——     ˜ d¬   %'7#73ds\š”t“ïÚ®Û¬  ÿàâà     5##!#!5!!#'##5#'7#5ÓÄÓµşxˆş¥.N-88.O¤<<şÓ-şñññ=FVZZVF   ÿàâà  ! & 3  54.+"#!#'4>;2#5!5!!53353353ˆ
¬
[ÄZñ¬Ò-şxˆşx=Ò<hH

HşxˆHHHşNññ<<    ÿğğĞ    %'77'77''7''7'7'7š1¦2UW0¨3UU3¨0WU2¦1WWŠ2¦1WW1¦2UW0¨3UU3¨0WU    Œÿét×   %'7'7'7_usQOusQOuwwRzRwwRş†R    	 l÷T   %'7!'7!'7÷wRş†RwwRzRwàtPPttPPt  ÿşâÂ    %#53'3#537'#53#7#53#553âŒX®®XŒ¯¯ŒX®®XŒ¯¯ŠŒ¯¯ŒX®®XŒ¯¯ŒX®®X    x XâÂ 	  #5'#5!âşÉ6ÜÂşñÜşÉ6     X‡Â 	  %rşÉÜ6X6ÛşË   ÿà à   0  ''7.54>64.'7>5 ƒnnƒ (F]55]F((F]55]F($=R//R=$$=R//R=$2ƒooƒQ6\G''G\64^E))E^40Q>##>Q0.S<%%<S.     ÿà à   0  '7'7#".'>32#.#"32>7Îƒƒoo1)E^46\G''G\64^E)#>Q0.S<%%<S.0Q>#cƒƒnnƒ5]F((F]55]F((F]5/R=$$=R//R=$$=R/   ÿà à   0  '7#".54>32#4.#"32>5Gnn„„¹(F]55]F((F]55]F($=R//R=$$=R//R=$Nnnƒƒn5]F((F]55]F((F]5/R=$$=R//R=$$=R/     ÿà à   0  '77#".54>32#4.#"32>5nƒƒnn’(F]55]F((F]55]F($=R//R=$$=R//R=$'„„nnG5]F((F]55]F((F]5/R=$$=R//R=$$=R/    2 EÎ»    ''757'7 Î¹¹Î¹ÎÎ¹)ÎººÎg¹ÎÎ¹   ? ´®    %'7'7'7'"Î¹¹Î<¹¹ÎÎàÎ¹¹ÎÎ¹¹ÎÎ   4 ª®    7'77'7'7ñ¹ÎÎ¹'ÏÎººà¹ÎÎ¹¹ÎÎ¹¹    2 Îƒ    %'77'7' Î¹¹Î¹ÎÎ¹ŸÎººÎhºÍÍº    <ÿàÄà  	    # ( - 2 7 V q  #!'#533533!73#5353#=3##3#553#5353#'3#5"30:3>7>54.##".54>32#çˆ¡
ccÓ[<—ş´=



	
àş ` 4ccşRÄ—şÓñ<=<ß			J    ÿà à  ! . ; H U b n „  œ ² ¾  "32>'6.#3#.'7#>7373#&>73#.7;#>57.'3#7#.''#>7:623:23#>73.'.'3*"#*&"#7>73 5]F((F]54_D))D_4âZMZZM.³ÓÓ³ñ[OP	Y,F	 ¥›
R
G uG
"
¢	™O	F
"à(F]55]F((F]55]F(şñ

Z

x



y

Y

		
ş 

Y



    <ÿàâà   B W  %#".'>732>7#'#'.'>327332>7.#"3H&1 6*)" -& ™9»
	or¶!şğ
		
]+ )6 /'&,!#D|ô
		x=|m		    ÿş à  	      !5!!5!!5!7!!5!5!7!!5  ş âş<Äş ş Äş< ş Äş<àxxZ<<ÓxxZ<<şñyyZ<<     ÿş à  	     " ' , 1 6 ;  !5!!5!!5!7!!5!5!7!!535#73#535#73#535#73#5—iş—KşÓ-şµiş—-şÓiş—-şÓµxx<<xx<<xx<<àxxZ<<ÓxxZ<<şñyyZ<<xxZ<<şñxxZ<<şñyyZ<<    ÿà à  	     " '  35#73#5%35##5335#73#535#73#5 ÓÓ——ÓÓµ——şÓÓ——ÓÓ——ÓÓµ——ÓÓµ——şµÓÓµ——µÓÓµ——      :âh  #  3#5#3#535##533#353#35#5335#Ó<[<µñµ<[<h=ññ==ññ=     ÿà æ    !5!37'7 ş  şñn’’n¯ş«Un’’n     <ÿşÄÂ " '  ##".=#53#32>=#53!5!Ä-=""=-[%11%[şxˆşxÂÃ"<--<"ÃÃ1%%1Ãş<   ÿà † 2 7 L a ~  !##380132>58401380132>5840133#7".54>32#!".54>32#7#.#"#.#"#535! şµW$:<

–

<şu@[Z'	¨	'µ†[x–				iyZZşñ				=



ZÓşÓ     ÿàâà  0 7  535#332>54.'".54>32#73#53-x-,M9!$=R//R=$!9M,(H55H((H55H(y—£%=O-/R=$$=R/-O=%ş[5G)(H55H()G5ÓxZ     xÿşˆÂ  . >  #".=#354>323#32>73#53.#"#53#jjjjX/Ò/t/Ò/Â		ş<		Ä

µµşx

µµ    Iÿşâ¡ ô  %+".'.+".54>;2;:>3>454.+".54>;2>54.+".54>;2>54.#*1#".54>;82132>54.+".'.4?>4'4.#81"+".54>;7>381232Ï		
ª
??
ª&+!‡bNE]


t	»	
	R–	@	

   ·¤ à  %+#81".'.46?#".54>7.54>7.454>7.54>;2;2+".'.+";2+";2+"32+8"1#";:32>?>;2·E]


t			ª
??
ª&+†aNÂ–

@

	



S    Zÿş¦¤   555¦y2‚2yL¤Z>ş—k<\     ÿà †    !5!%735#3'7 ş  ş~©zH™|„rò[¼Ez«Ywg    ÿà d    7'7753#53'!5!œ„r~©zH™|œ ş ×wf[½EyªYÙ      ÿé × 	    %'7537357'7!5!AVV22P2VV2ñ ş TVV2rr2Jrr2VV2¯   	ÿà÷à 	    73#'7%#37'3#Brr2VV2_2rr2VV°ï2VV2G22VVşª ş     ÿş ¤  #  3#5#3#535##53%!353#35#335#µ=[<µ-şÓx[y.=ññ=vN0ş–j0N  
 ÿşâÂ  ) . 3 8 = B G L Q  "32>54.#".54>32#7#533#57#53#537'7'73'7/7 &&&&ñZZş–ZZò@@Ô@@Ô@@Ô@@I&&&&´ÓZZşğZZ—d@@ª@@@@ª@@   ÿà à 	   '7!5!'773#ü’’nş¬Tnær’’nnnş      ÿà à 	   %!'7!3# ş¬n’’nTş Ñn’’nñ ş   ÿıâÁ % 7 I  .5'.5'372>=57>7.5%>7Ä!!!!BQFGQCşx	=:+ˆ*:>	Á  ""Ï<\; ;\>ÎÍ~			ş²#4F*-E5!	O
     ÿàâà  N c x   !!!332>54.'5332>54.'5332>54.'53#".54>323#".54>323#".54>32Äş<¦şx<
	Z		Z	
<şÓxyàş  şÄ!	

	!!	

	!!	

	!ş<y   ÿà à " A m  É  4.'>5'4>45%.'.54>7.=62672>7544>7'7'&&.'.=3>72>75.'.=7>7>7 -I[//[I--I[//[I-ÿ 0S="	*2882*	"=S00S=".5<3-'"=S0Á*28/*$	.5<<5.	*2882*	.5<<5.	w''şâ''L
	





	
ş;1

3Š			
00
	e


2	

	2
    &ø| % : ` u  4.#"32>7#0>7104041".54>32#%040414.#"32>7#0>71".54>32#Ü&''*'1<5j†''')'1<5j''&'./]OLJ''&'./]OJ     &÷| % : ` u  %">5'3"232>'6.#".7&>32#%">7'#2"32>7.#".'>32#*&0=4&''şä	((2;6'&&û'//]O&&'··'//]O&&'·      ÿì ×   %'#3735°9gyHOe2wl"dï„şÙ‹èŸş|4O 	  ÿİ à     & + 0 5 :  #5'##3!535'#5'33!5!5!7#5!#5!+53#53'#533#53 [‡ÄZZLZÓFFµ—xşñşğZ<ş´<Ä—´´<xxµ=+7~µñ]]ñ~AAy—ş9——]XXµµ<µ   ÿàâà * /  %#".54>732>54.'7#3â$=R//R=$/A&!9)5H((H5)8"&A/ÓÂ/R=$$=R/'I;)	$3?")G55G)"?3$);I'şÓ-    Zÿà¦à     % * / 4  32>=!#".=!'#533#533#57#53#53Z-=""=-ş´.%11%µxZZ––––h— 6))6 ——,!!,xxµZZZZş´ZZµ<    ÿş à   + 3  %#".54>732>77+532'.'3Ã%=P,/R=$ 9L,&B15H('D5!=á.R>#0?$³Ó-L9!$=R/,O=&!4E&(H52B'+ñ$=R/#@0´   ÿşâÁ  #  !";33335#".54>;âş´,  ,[=xñ[  [Á ++ Õ¥ş[¥Ğ!!²   ÿà à  	 $ 9 T i  –  !!!!%35>54.'5#72#".54>335>54.'5#72#".54>32>54.'5#352#".54>3  ş âş<Äş–



				i



x

				àş  şÄş<®TT
		
VV
		
K	””
		

		
K	ë		³³		M				     ÿŞ á       %''7'7''7şÿ  ÿÅNÅMÆÆÆNÆNâÓÓñÓÓáaş¾``BakJKKKJ5OşóOş¤OşóO     ` ÉÙ  3  7'.#"32>7&4&6'".'>32#½Ù	!!­şü

Zdş×   7PşÚ				   $ÿà Ø ; Q V k  .#"32>7940<1<0415.#"32>71%".54>32#5%".54>32#µ	  	   şµ:				XşñÕ				Øşê ¸5  aAşo			Y5Y5ş¤				    Zÿà¦à  - D [  "32>=4.##".=4>32'"32>=4.##".=4>32 "=--=""=--="ˆ%11%%11%ˆ				à-<#´#<--<#´#<-ş¦2%%2´2%%2´ñ
<		<
j<<   Zÿà¦à   ( 6  "32>=4.##5'#54>7".=!# "=--=""=--="ˆy,!—y!,1%%1à-<#´#<--<#´#<-¦•#/†•/#ş>%2‡‡2%   —ÿàià E R _  %9"040#1'574.'5#389.5#35>54.''.54>7'5C2	!!	7	!!
	v
	$B!
	À&¬"//"*¬"//"Z”í”     <ÿàÄà  : H i  %2>=4.'5#335>335235#54>73#".=+#5#".=3;2>=3 1%!,,!%1KÒÒ&&-$2--2$&x&w%1Z.$$.Z1%+:OXXO:w-&&-b)ZZ)bbb     â†  	   55%5%âş<Äş<Äş<Äş<†<>Ò=;˜;=      :â¤  	  # 8 M  !5!!5!!5!"32>54.#"32>54.#"32>54.#âşµKşµKşµKşµ[						¤<<Ó<<—==j—–       â‹      /37'''3#7<”¨¢œ¥¥ˆyw–xz¥xzZ+ş´,0M1#şó"şğşí$#şó      ÿğâÂ  + 5 : D Y n  '.&'57'.54>7'#7'5>?4.&>54>7'.5Ä%$µ¡¤ˆ		‡ x—yy-!y		4h$$şµ+/I=/*%

%*/]3-!‰!şğşËŠ!.3şğ%D

		   ÿó ®  ;  73".54>;'7'7#"%2+7'7'32>54.#*5''51VV1*Q**1VV15''5Ñ,!)77)1VU1 ,— ,,!2VV1)77)   Zÿç¦Ñ  + @ U  "7>54.#.54>32"32>54.#".54>32# "=-/8118/-=".,!%11%!,.!!!!				Ñ-<#1lZ==Zl1#<-şE>NT%2$$2%TN>k!  !–				    	   : †   . 3 H ] b w Œ  5.54>64.'7>55''.54>7'4.&>5%5%'.54>64.'7>5 ş—işZ
		
[iş—=
		
[iş—=
		
h 

		†

‰     Zÿà¦à + : Z  ";2>=4>7>54.##".=3#7#.'.54>32 "=-


	<			-="<Z8\		%11%		à/@%+"
?

@
#+%@/ş11²		$5((5%   xÿşˆÁ   3#53#53#f«["«["£şy‡   » EÃ 
   %#535#5332>54.#"3EŠ65S6T		

2àş4	

	    w h e  %#".'1'84"9'.#"32>77##".54>32532>54.#"'71>32 !,	m
!!,!!,o!!
	,!ï, 
‡!!	
 ,,!

‰	!!$$	
!,     †  	 § ¬ ±  %'4>75.'.'.>740<=4>7>6"4.'#57>?0<1&>564.'&"#&04033%'575  ş âş<Äşk$$	

w——yy†ş—kşµ/şÓ
	
	
5
			2¥;    xÿà¸à     3'#3#3#5'3#5#53©lÔy"b"x§7Ş|&&hxxqşéqZ<<ş<ÛÛ    ÿàúÕ     #'###!##'3#''7¦Z•Z‰Ò[Y&éçûùµµşÓ-şñ——ªª¸¸  †ÿğxÃ  I  %#".54>32.#"14>3234>7>76.'7

(/3'$	


		!



x#+$		 	       à 8 G V  %.#";535#5#>32##332>=4.'#".=4>;%+532á%=P--P=%	-!4E''E4!-	ş[¦ì3YB&&BY3y	—,M9!!9M,—	y²y——y    	  ÿà à  ) 6 ; @ E J _ t  %"32>7.#".'>32#'!3!7'3'%!!77!!%!7!%7!!%"32>'6.#".7&>32#—				

hWş¯Wÿ!!şf59şX:HÃş;Âş?%u'ş>Ãş;zh
		
=V_]Â#¾½$ÀA<<ş<yy—,,J‰‰j
		
<      : †    % :  !!7'!!77!!%"32>'6.#".7&>32#ªş­WÿWş¾1<şV=JÃş;z†„ÈÆ†[[şğ——y	

	<     ÿà Î ; Z y ‚ ˆ  — œ  702815>7>54.'.".'."7>32>7#>32.'.54>7!3!5353''#3#5!537'37#'3ì#'%

	

			%&$Z				"	Ğ			 !Šş ÄşÒ[ 2'"´–
 ¦şx‡AShŒ—7				


		
	€





ŒxÓÓx°$¿<<şñµ¡=#‡µÓ<<      Â ' Q ^ s ˆ  5#;732>732>=4.'+'0#".#'#".=>735%3##5#53532>54.#"352#".54>3(VF-	6<98	-FV(Ó%;&%>$$8H))H8$şµá

		hZZÔ	vv	Ôşáz{ĞĞÄ=
		
=     ÿàğà    35!#5'!ÃZÃş ÿ§l§àşêêêşôÖÖîî   ÿà à     "  #3733#3'#'!'##'33!xÄ•xz–‰EEşyL†ÅÔEE´˜yşòà=yñ(~7AA#şZ(~8AAş°jyñ  <ÿàÄà  	   #!'#533!#çˆ¡
ccÓµ—ş´àş ` 4ccşRÄ—şÓ    ÿş ¼   3 8  '.7>.'/.657'74>2762'?•œ´`ƒ­
	¬kWT´?¢R·TœtÔÒaZşÆ8%	şº2hojZşê  <ÿàÄà  	     !!'!#3#3!7%#37'<ˆşxQ*:*æwy ôşØyw àş  xZZşñ"uDşÓEşŠ"     ÿà à    !5!/#'7 ş  nnn’’×ncşn’’   ÿàõà    '#'##33'37#7!#õU‘ÒÔ“SåÔU>>‚=g<<ÓññlN—IN     )ÿà×à   "  37'#5##3#33535#5'!!5!'7!;;µµ;;µµµ4#$şÍLşÍ$#4+MJ—<INxx—<y,/[şÓ.,Z     I † / L a  %#53.''7.'#5'3#54>32##".54>7'7:6232#4.#"32>5 º›	"$$"	›º(F]55]F(Ä			>@	†$"	ZZ	"$5]E))E]5


mp
   Z :¦†  	  ZLş´.şğ†şµMşÓşñ       ®  ) M  75>;'7'7#"'1+32>717'7#"./.+32;7'!	:2VV2: ]^^
ë2:€	^^~
:2VV(
1VU1	)s	
##
1
	Ÿ		š1VV   Z 1¸    -5Z^ş¢ıış¢°®1}ü    Z ¦¤  	    73#3#73##3Zxz><¶zxZ<>ˆşxjş´Lşxˆş–Lş´    Z )Ì—     7'5'7'7ZÜÜTÂ§§Â—ş’¸¶@vwív£ŒŠ¡  4 )¦—     7'7%'7ÊÛİ¿şÜ¦ÃÃ¦á¸n¶wwvíwŒ£¡Š       X w $ R  ".#"&3!2>54.#!".54>3:37>327>32#€
)"%$/##/şâ#$$X

!$$"//"á

		##      ³ U _  '5>54.&'.&'&&&7'.54>3>6>67'775 #/SS$$#oo$$")
/#¿VV22/""%
			$$"		"0AUU3ìê1     	 ³ U _  '5>54.&'.&'&&&7'.54>3>6>65'7' #/SS$$#oo$%")
/#ñ2VV2/""%
			$$"		"0Ôêè1WW1   ÿàâà   .  !3#!#53!53>323'#54.#"#35âş<D&ˆ'EZşğ]]ZZÒ¤ş<Äşxˆ[yy[<<      ÿà + 2 7 < Q f   %#'##380132>58401380132>5840135+53'3#7".54>32#!".54>32#7#.#"#.#"#5! ;>ïZ><

–

<]uG.üi¬C/Z'	¨	'Ä³xx–				–ZZZZZşñ				=



ZZ     ÿà Â     (  5##5##!##3#5#3#5!!53353353!¦[–[Z Z=ñjş<Äş<<[–[<ş<¤ş<Ä<<<<şZşó+]====]      ÿ÷ Ç 1 H _  ".#".#"#70>3235>321'>32.#".#">323ô +'"$()  Lş*&#!"#%Ä&#$%#½		ş]¢ş€eş
cşš   ÿïèÂ  1 6 M  %0.=4.#"!'%>=4>32!#533#".5332>5Í-=""=-Ïş
%11%
ş¸³		7$c#>..>#c#c3&&3cişx		  	  ÿà à    , 9 F R ^ k x  "32>'6.#>7#.'3'#7'#.'>7>7#.'3>73.''3 5]F((F]54_D))D_4†	
ZZ
	\C
[)$"®X&'Ó	ZZ	\X'&¯[
"$)à(F]55]F((F]55]F(ñ !! ®"%&Ò
BÒ&%"Ò!  !"%&ÒBÒ&%"
   ÿà ¤      !5!%335#35733#35733#3 ş  ş<<y—<x–=yµ—µµ—Zñşññyş–ˆşxj     ÿà ¤      !5!'335#35'33#35'33#3 ş  —=y–<x—<yµ—µµ—Zñşññyş–ˆşxj     <ÿş·®   %#".54>;'7'7#";·Õ"=--="XPttPX1%%1Õ-=""<-PttO%12$    IÿóÄ¤   %+'732>54.+532Ä-="XPttPX1%%1ÕÕ"=-ş"<-OutO%11%-="    < Ä¤   %#53#53#53Ä¦sşÉ¦r6Â¦7s¦şÊr   ÿà ¤    ) @  !3!35!!!5!32>54.+"3532+".54>3 ş Ä<şxˆş<ÄşÓ—		—

——
		
¤yşµKyşZ-şÓK==´				Z   3 	Íà > S  %'7'3'#'>7.#"#3.'7'732>77&>32#".7Í/_7(.,
.,& 9^0	+13)ù

e^/%ä  ä%/^'++'0		

     ¤  	    !5!!5!!5!!5! ş  şZ¦şZZ ş Ó-şÓ¤—xy      ¤  	    !5!!!5!5!!5! ş  ZşZ¦şZ ş -şÓ¤y–y       ¤  	    !5!!5!!5!!5! ş  ş  ş  ş  ş ¤—xy        ¤  	    !5!!5!!5!!5! ş  ş-¦şZ- ş i.şÒ¤y–y   ÿşú³    !  !!#'3#".7&>32ÿøóúÈşsÆ	

	³şKµ=ş¦Zßvv?  -ÿàÓÂ S h } ’ ™  >54.#".'535#3.#"732>77'>54.''2.'>34>32.5".54>32#73#53»	
Z
		&$ #''# $&	:
		
şÊ

		µ%B11B%%B11B%y—		
%" 4004 "%
n	4	ş±1A&%B11B%&A1µxZ  ÿàâà      ! & +  5!!53#3#!#37#535#53'53#'3#53#5¦şxˆ<<ş–<<Lññ<ñ––xx¤<ş <ˆşZÄş<Äş<<[[yZZx[[==    ÿß à  ' 6 :  !#"7.+'33!!'#'73373#'>;27#7_şûMI
Ó˜ş§y ê"!!Y;Òddà<	şı•–	—şÓ` şZB°¶¶°B=--5cc   ÿş Â  	      !!!5!!!#53+53+53  ş âş<Äş<Äş<µ<=Âş<Ä[[şxşñL  -  ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  • š Ÿ ¤ © ® ³ ¸ ½ Â Ç Ì Ñ Ö Û à  3#535#;5#;5#;5#;5#;5#35#;5#;5#;5#;5#;5#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#<<=<<<=ş–<=x<=ş–<=<<<=<ññşàññ Z=<<<=<j=<<<=<<â<=<<<=<<  "  ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  • š Ÿš  3#53#353#353#353#353#3535#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#'""#*#"&*#/"&"&#'./74&4&5/<&546<5?46465'7>?26263?26232237<1/./7.''./*#'0172263?>?>7'7>?0<5<[<<<=ş–<=<<<=<ş–+(

(++(
		
(+'$$''$$'àş Z=<<<=<<â<=<<<=<<
(++(

(++(
$''$$''$ !  ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  • š Ÿ ¦  3#53#353#353#353#353#3535#35#;5#;5#;5#;5#;5#;5#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#35#%'7'<[<<<=ş–<=<<<=<ş }’’}àş Z=<<<=<<â<=<<<=<<Ò|’’|    ÿş ¤  8 G L \  "13!53!".50201223821!#";!%".=4>;##53'5!".54>3!#/

–;ş/xV

Vşˆ"‘‘‘şj³¤
ş·
2tşx![
	Zx=F((¡y— 
  ÿş Â  	     " ' , 1  !!#'373#/3##737'3#%3#53#5!5!5#73  ş âGOÛGXGX:GXGXSGXGX3GXGXşË9G€{G4Äş<ÄTGÂş<ÄZ<<[<<[<<<<<<<<<[<<şÓÓÓñ<<      Â 3 W  54.'54>75&'77>=''.='.=4>%7‡	â¦¦
,

	ğ	yy[yğ-,yD	;
§
CS/S£UÃ=|S»    ÿà à  ” © ® Ã È  .&77>54.'&&'01&"&"'7>5<.'75.54>7667>5<.'>5''.54>7.54>65'.54>6%5ÂM

	u	f		
N	
ZF	+,,Z>Jşµ¦+M	

v
g
		L?[
	G[˜ş•;Ò    ˆ 7 J ÒQ„i  *+1&".54>75#"*#*#*.'<>732>3>32"."#*.54>3:">'4.#"50&465>7>54.#"1>54.#0"#3>303812>732>774>7>54.#"54.#"04>54."#*30281>;3:023>;32>7"#*&47.54>7>54.#8"01"8132>77:63>454."'3#'4>7>54&041&04"'0*&1"&*#*#1>7>>4'4.#&1"#8"110>14>3>:3820120>7#.103861>74>564>51>454.#O	
	u		

				
	6	q
		

				T


	

		
		
J
	
	!%
			   ü¹  L a v   "10>7>76.#>45.'.7>7>32%4>32#".574>32#".5.1>1mL.4F)0cQ77]CÄ<QW
 .7
)$ ş™—		‚?jM,%cZ@¹"c`I$"#*fY<şà	 (,!		330ƒ		KE+ !    ü¨  . C N  #2>7>76.2#".7&>32#".'>3>3.#¸lM-5E*/dQ7
N…]t



•
		
)&b[?@iN+¨"c`I$"#1y^*_		w !E+     ÿş à     -  .''%''6>7%%''''“(+-%!	nÿn’"ß"ãş;Ãò;==;†!!şw‡;	şYKş³˜=;;=    ÿà à " A  %4.+?4.+"#"3!535!54>;'54>;232 	…&
Z	&„	Äş<
¬0Z0¬
y	ˆj

e	{{]]	­cd¬	]    'ÿàÙà     '777'3#¡PPddÒNNff‚0PPeePPeeş› ş        —    3  '.?7>54.'7''7'7>272ó*ş…£BçşÙ?@'Oa'98£@¤*l*şƒAæ	
¼>@w`&;
¥@£)     ÿşÂ   P  3#3#!3#3#.54>327.#"#".'32>54.'Z<<Z¥==[[š					 
ÂşxÄşxÄÒ		

		    ÓÿàÊà    %'7'73#ÊeOOe÷àePPeÿ  ş   6ÿà-à    '773#°PPdd^0PPee°ş        ÿà÷×   # '  !777777!3'7#5 ÷ş	YLşpèè‚‚×ş	÷IYMşèè ‚‚  <ÿãÄà    ! & +  7777!''''!#53#537#533#5<=.-----<şxj------ L[µµ<yyZÓÓÒÒÒàşK999999KışY%999999'‹şw/y<x  Zÿà¦à     73#57!5?/!/?#!5ñµş´!"
"!#	¤$†¦¦QBB¾%%¾É	
Î   ÿä à     7'7%'7?/'7/?£Ÿ]Bo/ê/!»9t³¿
t˜Ÿ!/ê/o(»t~¿¦   µÿİKà   # ( -  #"74.#32#54>3'3#'53#=3#<	LJ	<<ZR ZZZZà	ş¿••A	şx77UªªÈ   ÿîñÑ ' M b w Œ ¡  "'.54>7>27>54.#'.".54>32'"32>54.#".54>32#'".54>32#'#".54>32 2XA&$>T0'Rp
)&AX2}^":*!:L,,L:! #



Z				SÑ&AX20VA'R		p-3:2XA&şf^

	&6B%,L:!!:L,0,&å				Zi	

	      ³ +  ) > S h }  "32>54.#".54>32#7"32>54.#".54>32#7"32>54.#".54>32#<						Ä				Ä						+				ZZ				ZZ				Z    ³ +  ) >  7#".54>327"32>54.#3"32>54.#x				ˆ				Ä				ï				<								    €ÿà€â  C Q  >54.&57'5>55'.54>7'>7'^	"//"	"--"©	$$	*B	/""/	ğ;=ò‘6QxzO8
$$
şš¹¹  ÿàâà   $ ?  #".5#32>5##53!#53".=332>=3#K—(@Q))Q@(—y[[şÓ[[iD;'[&&[';DàşÏ1şÆ0J22J0:ZZZZş<(@.£š%%š£.@(     ³ +  	  !5!!5! ş  ş  ş +x       Ñ  ï  	     "  73#535#;5#;5##35#;5#735# HUªUªUï     Ñ  ï  	   73#535#735# xxÄxxÄxxï    ÿà à  	  !!!!  ş âş<Äàş  şÄş<      ÿà à  	     " ' , 1 6 ; @ E J O  !!!!%3#553#53#553#553#53#553#53#53#553#53#53#53#53#5  ş âş<Äşx.àş  şÄş<ñyµxyş–=-y=y<<=   <ÿàÄà  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  3#535#;5##35#;5#;5#;5#35#35#35#535#35#35#535#35#35##35#;5#;5##35##35#35#35#535#535#35#35#35#<ñ<ñ=<µ=´<<µ<¦=ñµ<µyKş–<yñ=<<     ÿş ¤      5#!!#53!3!53#ÓÓ şÓxxx—ş<—-yyy†şZˆş´j[şñ-    ÿş ¤  
     !!##53##53!3#5!!iş— —yyy—––şÓyyÄş<Ä¤şZ¦======ş–şñ     ÿş Â 
     #33!!3#553#!#535!µµ—Kşµyyyyy¦şñµµÂyxµÄ—Zµ-=şx   I Â 
    5#353!5!3#553#ÓÓ—KşÓxx–yy¤xZ[[        Â  	    !!!!%'7?'7'  ş âş<ÄşªGG11Ó11GGÂşZ¦şxjş–nGG2222GG    : †  	    7!!!!3#5!3#5<ˆşxLş´ˆş:Lş´.şğğğğğ     ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  †  #335##35##35#;5#;5##35#535#535#35#535#35#35#35#535#7#35+35+353#3535#35#535#535#35#535#35#535# ——ñ5¡56¤ô5k5†àş  ş ñµñxµ<-yşZ<y<´<y     ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  • š Ÿ  3#535##35##35##35##35##35#;5#!35#535#35#535#35#535#535#35#35#35##35#!35##35##35#;5##35##35#35#35#535#535#35#535#35# ¦=<<<y<jş–<-<xñµñµ=ñx<yş–Äş–<y´xµy     ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  †  3#35#;5##35##35#;5#;5#35#35#535#535#35#35#35#35#35##35##35##35##35#35#535#535#35#535#535#35# ——ÓÙ5k5¡65659àş  ş ¦ş–ñ<x<=ˆşZ<µx´=µ   ÿşÂ       !!'!'!7?' ş ôÖÖÉªÕÕÕÔşVÖ××Âş<Äâ»v»Ã¹¹Íºº
»ş‰¼      ³ˆ  	    !5!#53#3#5#53 ˆşxñZZÓZZKZZZZ   Zÿş¦Â  	     " '  !5!!5!!5!7!!5!5!7!!5!5!7!!5ZLş´.şğşÒLş´şğLş´şğLş´şğÂZZ<—ZZ<´ZZ<µ[[<     ³   	      735#73#535#73#5735##53 ——ZZ—––ZZ–——yZZ³ZZ<<ZZ<ZZ<      ³   	     !5!3#5#53'3#5#53  ş ZZZZÓZZÄZZZZ     ÿş Â  	    7!!5!5!!!!!<Äş<—-şÓ-ş  ş<ÄXZÄşµKşñ      X h  	     "  5%7'557'5757'5ñşññÓÓşA°°GiiiÓÓÓÓÓ#°°hşñğÓÑğ xY=     ÿş Â  	    %!5!!!5!!!!Äşxˆ[şÓ-—ş  ş<Äwiş<Äşxˆ      : ¤  	  5%%  ş Äş<¤ş—kğÒÔ      ÿş Â  	    %!5!!!5!!!!işÓ-şÓ-—ş  ş<ÄÑş<Äşxˆ      ÿş Â  	    7!!5!5!!!!! Äş<-şÓ ş  ş<ÄXZÄşµKşñ       X h  	     "  3#73#'73#73#'3#7!!73#7-¯±jhÒÔÔÒ¯±şÒşòÒÔhy<x<şğñÒÒ   ÿş Â  	    7!!5!5!!!!!Äş<Zşğˆş  ş<ÄXZÄşµKşñ     :âh  	    !5!!5!!5!!!5Äş<¦şxˆş´Lş–ˆşxhµµ—xx<=     : ¤  	     " '  !5!!5!'3#535#!!5!5!'3#535#ÄşñşñKşµµ——ZZ¦şñşñKşµµ——ZZh[——y[[x[y——y[[        †  	      !5!!5!35#!!5!5!35#ÄşñşñKşµµ——ÄşñşñKşµµ——I<——Z[——     : †  	    !5!!5!!!5!5!¦şZ¦şZ ş ¦şZ¦şZ ş I==x<<y       X h  	     "  #53#35'35#35#35#!!!5!ñKK---ZZZZKKşZˆşxKşµIZ<–=şğñÒÒ     Ñ  ï   %!5! ş  ï   ÿşâÂ  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |  † ‹  • š Ÿ  35#73#535#73#535#73#5735##5335#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#535#73#5ZZ[ZZZZZ[ZZ<şZZZ[ZZZZZ[ZZşxZZ[ZZZZZ[ZZşxZZ[ZZZZZ[ZZhZZ<<ZZ<<ZZ<ZZ<—ZZ<<ZZ<<ZZ<<ZZ<´ZZ<<ZZ<<ZZ<<ZZ<µZZ<<ZZ<<ZZ<<ZZ<   ÿà à  	     " ' , 1 6 ; @ E J O T Y  35#73#535#73#5735##5335#73#535#73#535#73#535#73#535#73#535#73#5 ——ZZ—––ZZ–——yZZş——ZZ—––ZZ–——ZZşx——ZZ—––ZZ–——ZZI——yZZy——yZZ——xZZÓ––xZZx––xZZx––xZZşÓ——xZZx——xZZx——xZZ     ÿşâà  	     " '  35#73#5735##5335#73#535#73#5 ÓÓ——ñÓÓµ——ş<ÓÓ——ñÓÓ——ÓÓµ——ÓÓµ——şÓÓÓµ——µÓÓµ——      ¤  	     " ' , 1 6 ; @ E J O  3#535#35#!35#35#35#%35#35##35!#3535#35#%35#35#35#!35# ZZZZşñZZZZ—yyyyxxxxµ[[ZZş–yyyyxxxxşğ[[ZZ¤[[[[[ñ[[[[.=[[–===<    : †  	    '%5%5  ş âş<Ä<şÒ.———†şµMşÓşñ–;=       : †  	    '%5%5  ş âş<ÄZşÒ.———†şµMşÓşñ–Y=;       : †  	    %!'!7!!!!37#¦şµM[şş=ÅşŞƒï—ş´LşğÓ<<    X †  	     #5335#%!!!!5#35ÓÓ———ˆş  ş<Ä——<µşÒ.ññ=<<      X †  	     #5335#%!!!!5#35ÄÓÓÓ——ş  ş<Äşñ——<µşÒ.ññ=<<   ÿàâà  	     " '  3#3#3#3#3#3#73##3ZZ[ZZZZZ[ZZ<  ş âş<Äş ş âş<Äş ş âş<Äş  şÄş<     ÿà à  	      3#3#3#3#73##3 ——ZZ—––ZZ–——yZZ  ş âş<Äş ş âş<Äş  şÄş<     ÿà à  	    3#3#73##3 ññµµñññÓµµ  ş âş<Äş  şÄş<     ÿà à  	      !5!!5!!!7!!5!5!7!!5  ş âş<Äş ş Äş< ş Äş<àZZ<ş´şğñÒÒş—ZZ<      ÿà à  	    !!!!!5!5!!  ş âş<Äş<Äş<Äş<àş  şñşÓ==—<<    ÿà à  	     " ' , 1 6 ;  !!!5!%35#73#5!5!7!!535#73#5!5!7!!535#73#5xˆşxjşµKşZZZˆşxKşµ—ZZZˆşxKşµ—ZZàşññÓÓ—ZZ<ş–[[==[[=µZZ<<ZZ<    Zÿş¦à  	  :  5!97".54>32#5>54.#"'5!Z¥§ş´¥ˆy
		
yàÄşâÄşZñÎ¹



¼Ñ      ÿà à  ) 4 I  "32>54.#".54>32#73#535#53'4>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/Z;7à(F]55]F((F]55]F(ş$=R//R=$$=R//R=$m†¤ß     ÿà à  ) > s  "32>54.#".54>32#7#".54>327#4>7>76.'.#"#>32 5]F((F]55]F((F]5/R=$$=R//R=$$=R/#	

	

!	à(F]55]F((F]55]F(ş$=R//R=$$=R//R=$rñ
		

     ÿà à Z q €   .#";;2>54.+"#".'3535#5#>32##332>=4.'32+".54>3'#".=4>;%+532Ø*9E%%E9*$RZ

ZR 
%0::0%
-	ØZZÄ¦+(C//C(	x	"		
	–"7((7"–
x	şñ[x––x    Qÿñµà Ô  %#".=4>7>=4.#"#".=4.#"#".=4.#"#.=4.#"#./.#".=./.>76254>322>2322>2322>232µ!cc
		
è``/&nº%ÖÖ
	”		F	

      ş€ Ô  %+++".'.+".54>;2;2>54.#".74>;2>54.#".54>;2>54.#.54>;2>54.+".'&4>?>&'."+".54>;>?>32ş
F			`		`/&mº%ÖÖ
“
ş			
!cc
       ï€ Ô  %+"+".5<>5#".5<>5.5<>5#".54>;'.47>32+".'./.+";2";2#";2#";2>7>;2ï`	
	F		”
ÔÓ$ºn&/`I
			
bb!     Kÿà¯Ï Ù  %"./#".=""#".'""#".=""#".=4>7>=4>3232>54>381232>5>3232>5>332>=4>3>67>&/4.'".=4>32
		
!ccŒ
	”		F	

``/&nº%ÖÖ   ÿş à     %  %!!5!#''#5#775!!!53!#53ˆşxˆş–KN"Dl×H?&*şñKşµâşxK<Z³-şx[ñd%u´ññyl)6Z<<şx<L      ÿà à  ) R g |  "32>54.#".54>32#7#".54>3232>54>32%4>32#".534>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/ˆ%11%&&ÿ ´à(F]55]F((F]55]F(ş$=R//R=$$=R//R=$Ó1%%1&&i    ÿà à  ) R g |  "32>54.#".54>32#7#".54.#"#".54>32%4>32#".534>32#".5 5]F((F]55]F((F]5/R=$$=R//R=$$=R/ˆ&&%11%ÿ ´à(F]55]F((F]55]F(ş$=R//R=$$=R//R=$Z''2%%2â      ¤  ' 6  !"3!2>54.##!".=!54>3!2!ÓşZ		¦		şZÄş<¦ş<¤	şÒ		.	ş¥¦¦ ..  Z ¦¤     ?''%#3ZÛÛ/)¸¶ş’.vwíMşxˆ  Z ¦¤     7'73#ÊÛİ¿şÓß¶n¸vvwí;şxˆ  K +µ•  )  "32>54.#".54>32# %B11B%%B11B%7))77))7•1B%%B11B%%B1ş´)77))77)  < :Ä     !'#7!5!ÿ¶n¸wívÅşxˆÛÛ/şù   ÿæ à  + @ \ z  %3#".5332>5'2>54.#"332>54.#"3#".'7.54>32#4.#"732>5ˆ%11%&&¦		x¦$=R/¦V$=R//R=$5G)(H52a)G5ï1%%1&&-/R=$V¦/R=$$=R/)G55G)a25H(   ÿà à " 7 W \  %4.'754.'''5'5''5''5''5''7%%54>7'54>7775 	‘		<		‘	ö'3—3ŒşGº<ºş>Ñı	n
g"
h³µjÿ ;=Y[xz;=•—µL@geBJó   ,ÿàÔà * A h v ‰ Æ Ï ö^u  2>7>=4.'.#"3'4>32#".=.4&=332>753#5#".'#54>32.'373#5.'.'."#*23:>7>7>5<.'##5#53#5#".'4.4=3332>7537#".'#53>327#32>56<53#".'.=4>7>32'#".'5>32ú		Jcşè#I('(('(	('(('(şÙYMaa3				z
2				2
g<<]pim­/KKrMM
Ô		£££phl*½>	9
1

#=V   ã§ ¬;  .#*#2362#".'.'4&4&/.'.'"."#"2:>72>302232>7>7>764.'"'./.'.'.'.#""#0&401>7>7>3:2332>7>56.'.'>726:32Ø

 !		

#!

		
	
				

	'

		&">7-
8	'5< 			

	
			        ° i ñ  #>7#.&.'".'441&"'&"&#7&&"'>50<#>7'&"&#>7>4'.'.'445>54.'".'46564>764.'.'465>7>45.<54>723301 		'!=70
!#&)+IoL'R BeF	
	
	/26	'&!5Wj5	E)`N6
					    ÿàà  ) 0  "32>54.#".54>32#7#5335]F((F]55]F((F]5/R=$$=R//R=$$=R/¡µ—à(F]55]F((F]55]F(ş$=R//R=$$=R//R=$Ó–x     ]ÿà£à O ‘  %'.'.5.=557262>7>?5#&'.'.'.='5>7>7>7267Œrra

5			


5

	)rrb	nj{

_œ			pP¸)
	y,Š		(    ÿà à 2 w À  %>54..'7>54.'./""'.54>?'.54>73>27'7'.54>7>54./.54>7'.&è-Lf8	
2%	-Lf8	
2%	p+K7!	'+K7!	'"+/#	
."**"
	 #µ

5_@&1	

5_@&1	¶
"6L*

& 8J,
	(­$
		
 	

  ÿàĞ  :  7.54>7'7'7&%%.=%>=Í-<#WOttOW2%
ş[
¥
M  !=,OusQ$2‚ÂÄÂ
Ä    ÿà Ğ  :  7'732'>54.+#!".=#3!2>=#¦ttPX"<-%1XP<şZ	¦	èttP-<"!	1%PÃÃÃ		Ã   xÿà¦à 2 > X  %<54.1000>732>514.12#>3">73533.#i""%/.%Zv		x		•3839==98%-"ID	DI"-$$ş–	ÒÒ	  :ÿòÅÌ n  '.'5.5&4>74>7.44>7>54.&'.54>7Å*:#		

	"-!5&4N4*E0%+J5	 	
	#>3

	,7!*&3$ @6!0;!      ÿàÄ¤ 	   #5'#53!35#!5#Äşç²âyşÓÆäi¤â«şæşZ-ş—èÊ     ÿà à  	     " '  75!73'55#73'5'35?#57!5#57éşéÛÛşùÒÒ––ÒÒ––ËşéùÛÛ&òÌ®±“È¬ˆs8Ê®“Šu;Îô&°•³     " = ‚  	   >   55%5%577>54.'"2>675'1>54.&#62627'6&"&"'27>54.' ş—iş—iş—iş—X
		4%	h –z  GT	
	¸
T		
    ÿúñÆ   @  3#7";2>54.#"5#035<>7>32354.#hh41gg	
g +1şÉ7•
-@|i­
¦²$4#      ÿà à  	     " ' , 1 6 ; @ E J O T Y ^ c h m r w |   #33#!35##35#;5##35##35#35#35#35#535#535#535#35#535#;5#;5##35#;5#35#535#35#35#35#535#535# xxş ZZKg4h88h4gàş  ş  ş ¦şÒ<yx<xñy=y<µ<=     ÿşâÂ  	     " ' , 1 6 ; @ E J O  3#535#;5#735#35#;5#;5#;5#35#;5#;5#;5#35#;5#;5#;5#ZZyZZxZZyZZş–ZZyZZxZZyZZş–ZZyZZxZZyZZş–ZZyZZxZZyZZÂZZZZZZZZZZÓZZZZZZZZxZZZZZZZZyZZZZZZZZ   	  ÿà à  	     " ' ,  3#535#735#35#;5#;5#35#;5#;5# ——µ––´——ş———µ––´——ş———µ––´——à————————şµ––––––µ——————      ÿşâà  	    3#5!35#35#!35# ÓÓÓÓşñÓÓÓÓàÓÓÓÓşÓÓÓÓ   ÿàâà  	    3#3#;#3#ZZyZZxZZyZZàş  ş  ş  ş  ş       ÿà à  	   3#3#3# ——µ––´——àş  ş  ş  ş     ÿà à  	  3#!3# ññññàş  ş      ÿà à  < Q k „  !"3!2>'.##!".'7332>7.'3'#".7&>32'.#"#'>3!2#7+".'7&>;2ˆşñ+" -- "+[ şñ `&53(bp (**( 	 s  sD(*à!,şğ,!!,,!şx!!µ4''4µy**))Z=!!=c''     ÿà à  V k …  ##5#53533#".54>7>7.54>7""#".54>7>;#'4.#"32>54.'*#"32>5 O'OO'OÇ
""1*'02)%‡*)#P
%,&")"‘'OO'OOşÎ		
$

'( $* ï,%*$ş÷		        ¹  ) p š  %#".54>32'"32>54.##".'.54>7.54>72>32>34.#""#*.'.#";2>5Š	
		
	ì		
		
b6@EGC9


E

/949/‘		;		$$ !!6  #++#       r N  ) >  7#".54>32!#".54>32#4.#"32>5Ü(((($((((à((((((((    ‰ÿàwà   ###5354>;#"3w	Gi54+ G,P8Xÿ  X5+X		,    ÿıüÄ     " + 0  ''757'7''7'7%7'7''5777'7ü \\ ^^h”•g^^jCkDiiiişÏjDkCCkDj?wv\\QjDkC\hLLhJKD.XX/CKJCE6B9AAAAHE9B65B9FdFF
LL
dF9B5   ÿà à  . C S r ‡ —  "32>54.#..'>70'.'>32'#>7<652:32>7.5>7#".'.'>2 5]F((F]55]F((F]5â,)&%# K!#	)'"ó	"B9-!+†0<D#)@1!		S.?(
'$!
#%)$à(F]55]F((F]55]F(şü"%'«"!!' !"1*!Î'*'#'+¯
%)&4,"
"*1/("   *ÿàÖà d É ò  %.7&>7>7.'.#"#".'.#"32>7>3232>7>7.'#0.'.#"#".'.'>7>3232>7>3201&>7>7¦		

	

	


			

		
	

	
	

		|
	
‘
				 '&'

	
c	$#"			
	;		



    'ÿàÙà ( ? m ‚ — ®  !+#".7'##".'5#".7''"32>7'6.#%!&>7'&6&65202>327&6:1'6.#"32>'3.#"32>7"32>'7.#s

)	+


	Fşä		Äƒk	

4Í	F		FF		F	Í„„"())("?E„„    ÿà à   " ?  !"3!2>''3'3#'37!!%+'!#".'&>;!'3«şƒ
§V¹[ğz˜Kş³‰şy./Cà	şZ		Tyy——ş<µµÓÓ¦µµBş    ÿà à    ; P e  !3!2>'.##'37!!%+'!#".'73!'32"32>7.#".'>32#ÓşƒV§
JğòşÑKş³‰şyC/.ã''%%àTş		¦	<<ş<<<sBZZşZ<&&&&´    Aÿï¿Ñ 9  ."#*7.'23:>7>723:>7((*	 !! 		Í#FFD"555456,,,Í  ÿïñÑ  ) 5  ¢ ¸  %#".54>32#4.#"32>5%.54>7'02627264&#"10".'"3221'0262726.#"1*#>32"0*1"03#".'777>5<&4'ñ&AX22XA&&AX22XA&$?S00S?$$?S00S?$ş]c+9K	 -L	%-2&$ 
9		=@Œ&?
à2XA&&AX22XA&&AX2/T?$$?T//T?$$?T/Tşò&08
ŒEŞXˆà"


ˆ´®À5-&·   ï® `  .6'.'.'.'&>>7>7>7>.'æ
# 	

'›	'
	"#	
	
	
+'
"E=.     ° i  '.'667>7.'666>7.'66"7.7&>7&6&4'>7>7>7Ë(KpH**%$  	/8<"&
			H3lU7



#(%	
	     lÿï”Ñ K  3#32>7#".'.'.'.=#5>7>7>73rr
			
5	EÑzK|

	L	ªD

	     ÿïñÑ  1 J  %#!".54>3!24.+";2>534.+";2>=ñşFºşû——Ó——ºşF’ş¾BÉÉ   Cÿï½Ñ    # ( - 2  9!*953353'537'77'77'77'77'7}şĞ!ù @¿¿¾½·
¸¤¤("k"k/(!(!Æ¦¦¼7)(\()5'1(2/#`#`	»¼     wñI  5 N g €  º Ó ìV{¥  72446"7'766667764544#'4646667660464"7'7"6666372054"6#'76"676204"4&7'76666776054"4'>4660676204"4&7'646&7"6066237254&4#'76"6762'"4"&40326660?725.4#'7646272&44&7'7"6066237'6"6"54446502166662722606"7"606#?"4".7'5?"6&666766223&&7.4'7">>2762627'°=D	%

¯,+*11444444332255!N22&'c44iinn2233jj11hhyz+0„†0½"
  ÿïñÑ T  %.5<61'.54>674&<54>6.'1>6ñ%%q
%%
q%%%
qq
%S$$:	#%8&&$	97&     ÿïñÑ  m  %%.54>%'&'<5040417>54.&0.&>701>54.ñ!şÒ!!.!“
KK

K

K
I "/" şÓ{%'	%
'

      ñª c x ¡ ¶ á ö   %#".'.'6&647.'>32>?>23>32#"./>32%>7.#"6.'.#"32>7>'".'>32##3".'4&647>23#2>74627#".7&>32732>'6.#".#">7Õ	"((*&$	!%&T		
K$#		
şZ
		•	 %%'#""#'%% 	şõ•

	

	V	

µ




	
f
			X	

#		

		
		
				0		Q				½		

™
     ÿïñÑ ‚  "<>7>10.54>3232>54.#""'.54>32#".'032>54.# 2XA&&5 
	
%,+@+#8("0
	2XA&&AX2Ñ&AX2%D9-+-$
	

#." *
6+&2$<,&AX22XA&    ÿà à  	    7'5555 ÒÒÒÒéşéşéšË­şÉ«“Íõ'şM'óË   	 4ÿğÁÑ ë,A[fq†¥º  %&'.#*#*#"#.'.'&>54.47>7>5"#&"3>.'..45>7>7>7.54>7>32##.'.67>7>.'.67'>4&'.'#.4'.'.'&>&'.#"&>3627><5.''&*54.#"72>4#".'4>2132>7>7>22.32>'..764*#>4&'.70>227>7>233>74.67>234>4.''0>5><#"7"30238205<.#"4>"#762#.#7*1262614.17.#>7:>50.1.2>5.'¡

				
					
	
	

	-	
		
		

				
Ü>!							 

			

	
			
‚	
		
		
				


				
M’:v    ;ñ… 8 ‰  %'&&%".54>7.454>7>71>7.'.54>67>54.'>6.'7ñ"şâ#

		"'4'	şÑ				$			$™#"	'2&
		!	
	#
   ÿïñÑ - Y … ±  %&''.7&>7.>?>?'./.67.7&>76'7>&'.'?>>6.'./7>7>&/72-/

	
1.3/16/l020

	¿
.j13/


	.a/c
v0	
		111/31l/11
	
*/m111

ş 	
1
a1c		  ,ÿïÔÑ    '!!3/#35?#'37Ô'®¬'¨Oşö¸<;4mlÂËÑşO11±Y E*T¤74     ÿïñÑ  ) >  "32>54.#".54>32#3".54>32# 2XA&&AX22XA&&AX2\¾Ñ&AX22XA&&AX22XA&şÄ        ¤       !!'!'7!7?'  ş  Ğ ĞS=<şe’‘‘¤şxˆìÎÎ(<;şã     -ÿïÓÑ ( [ ‰ ¼  ".54>7>7>7#7"#".#"32>32>7>54.##".'4"0"#*27>7><'0.'."#*>7>3227>4'.'*M;#&$		#%"9L*¥		
#

&#
@	
			8L--B-
		.D..K6Ç	’/      ñÀ       77'77'7''75c,bñccbc+*Ç\RYª[PY
]TWYR\OkQVV   ñº   '73?!7!7!7!ñHÜ½R	t„ş¶Iş¶™ºş•IIa(,,\Q4Q    ÿà à   . C \ u  %#4.#52234.#4.#"32>5##".54>324.#!"3!2>52#!".54>3!,1A&,L9!Ò=hM,1VsC[	

	i	şZ		¦	-şZ¦:%@0 9K+=,Mh=CsV1şğ

		Z¦		şZ		µşZ¦     ÿà à   . C  #.#72236.#6.#"32>'##".7&>32Q/To@E{[6ş°f¯ƒJP‰¼kw
		

		
 >nR/4ZyD K‚°el»ŠOş<						        Éµ‘ö_<õ      Ï¥RŸ    Ï¥RŸÿ÷ÿÜ	æ             àÿà   ÿ÷ÿ÷	               d                   =     <    i    ÿÿ  –      <   ÿş ÿş                —       k         —  %             Z  <  i  i  —     #    '  #  <  ;  [                    ÿ÷  >  /  ^     "  -                ÿû           #  —    Œ  r    2               ‡  ˜        Œ  	    x                2  ?  4  2  <     <                <       x  I    Z           	                                Z            `  $  Z  Z  —  <               Z     Z  x  »        x    †                      <    <       )     Z     Z  Z  Z  4                                 <  I  <     3                -                                           '      Ó  6     <  Z    µ          €                   <                                  Z                                                                                            Z           Q       K              Z  Z  K  <       ,         ]          x  :        "                                   ‰       *  '        A         l    C               4      ,       -               
   H º²:æD@˜òp˜ ÂRğ	j	¾
"
~BÀ"Nš° R¾Ü,¤²TøLÌâú&¶Ğl–¾òJˆ¼>ô<¸ô6Z†8x¢ ¶ârÂ(D®ÀÒäø0”  ` ´ Ô è!!d!!¾!Ü"
""":"†"Ğ##`#~#œ#º#Ø$p%v%ô&*&ˆ&Æ&ô''L'è(6(Œ)°*Ä*ä++(+T+€+°,(,F,d,Ğ-Š.˜/./Ò/î0B0ˆ0Ô11R22T2¤323¬3ú4r4ú55Š5¾6`6´7*7ô8n8†8´96:$:J:x:Ş;P< <^=4=æ>>@>b>Â>ø??<?r?ô@@~@”@¾@ŞA ApAúB„BÈCfC¤D(D’E>EpE¢EÒFFFzFòGG>GdGŠGÄHHÔI0IdJ€L†M^MÔN&N O²RSBS¶TT^T†TŞULUfU‚UÈVVDV|VÀW˜X<X’YY^YvY¨YÂYÜZLZş[([V[„[¦[Ö[ü\ª]v^$^P^r^¶^ä__6_t_œ_¶_Ş``D`l`’`Ôaa0ahavbNbÌccxc¤cĞcúd&dRd˜dÎdôe,eTe²ffjgg¾hÎiŞjîkşl@lämˆmØmönnPnloo”qjst>t„uJvLv¤vöwfwşx$xfy yxz"zzĞzò{{6{L||´}€}Ö}ü~R €bR¶‚N‚ ƒŒ„„°……~…Êˆˆv‰ŠŒ‹6‹^æ ¦Ô‘,‘\’V’„’¦“F“ª     d» -                         ®                 G        $        U                2      
 ( c  	      	   G  	   $  	   U  	     	   9  	 
 ( c t h e m i f y V e r s i o n   1 . 0 t h e m i f ythemify t h e m i f y R e g u l a r t h e m i f y G e n e r a t e d   b y   I c o M o o n                                                                                                                                                                                                                                                                                                          7Æ¯Xó;ZG|§/Æ¸°ĞG[ÿ4höx
¯cp\³òÈìñ£îñ—¢Gó}ÿ[Så,¬dwí6™´¿_çB3…ÕObĞì¶kÎÑ[pº?‹ŞHªn.Rìô½Uÿ»³ € !†Åe2N`­-<Š4ÇÅN;Ì§p¸»?GÅª	&a×ëso2
S›‘ªêŒnÌ·_	óãİ‡‘EÂ?æÉ .^°ÉÑ£1ü ³€™zA-îûîüêÆO-¡–øw•E=EÎŒ† }î•³»C¢LŠ1İ&†Îÿå\<KÔû§f<‚
ÚÎöõ:’ÙbÀ^%ÜOâgs¶ùaˆ+®Å¦\”k$Á³#Åí oÎÖ–Pr´sõ JÆ~}Höá´Ÿğ¼9Õ•¼MI­ŞI·s±AU0C}ER¼`(2Vâô'aÄTÇz
|†™(84}ĞmƒA»[â«h‚Ş¾^Îğ=á˜‰<âU¾N3-’Üª-åš#yµ2¦¹êéc1î&8_[¹k	©GÈª~$2bUªCzsn¨=ÅJ–Ø4f¡PÏö°½Qåz•ë_A¡¾W´òbÌZ¾s¶¬½ö_–ï©¡I×ë`™³¶Ù?˜V_
w‘ü'í—­3æ“ÄNA??Á X‹¿P n'}0á¯Ö÷ÿIéÃïğ›S4(®¸UOÎ~Uˆu´ö°”³#e0ÇëÇ4(l^sé×<J£î“ÀTs˜‚»P”D¾è1¦d{­6“í¯€úÄŠ–€ñÑ@ïİËØÜÒËc×á
|ÑNw¸ma£ómŞªlÔÓâk[UÌS|Bºi‰ŒrPDs÷ñ«ï˜V_„Fª˜šïpk±°]ş»ı°%”-¨¥Û%œáâ¥¤GŒŸ*pç·Ñ•9œ0JµxâÆÚw[óù,s}Âğ}ÙT`•OuÉ–P ¦^uû„SJ|ÇNJ½q».Æ>Ës÷’|™@õû@ë[íöÖçYÜ¹¿½˜cİ@â£WBU’TÜ>"“†v‡,>Í)*rÂ›V”Dİdo‚ÍÇ&E£„]@jØŒ¬Z3YÊ¨jÕaĞN~ë+Öd®~ˆÓYbo—À‚?ĞkÍÄUÓ-â2ƒƒÆ<K,’ãí\AR¾—ÅƒÏònÙ1ı:QªÏ©›v¶…ë¨.¿2O£¦d¡>êöğàQG­ßK°>ª¦kSØˆ[yd ™YO|^K¬pgdèı˜>.˜pİŸ}\¸XŞ²©^9‰ï÷ãäOº2„RjeÎ—S#_2}¥Zõ¹Ãü¸iÖköû¬¨^c‹š7sş£#¶Ä;~$†7ûwØUüíèça9†ˆçƒ3“Ä½™”ôùîŞŠ¯½9[Cñ(@óHÜÈõŒìNéÂ ¦¼1j°Ã±YL[±ãàç RÄ_Œ˜d•É7pO3ÖírRDÂwGrd1#ê<S²pÂ~wÂ 5é<·¾P•ª\õ€ıÓ9¹¬|ÏÆ+–	²Y<ø >Ds/¹²¨ŒëšDŠSâdŒ ¡ö4?_êjß~ZGrÊà¬Õ¨Æ+eAQëN¬KùBÂ¶¤…i:Spù{@÷šáB}T¨œ;¯…0‰ 7U¾=O}Å““y›Şš6ËZè,`JÏ:ş|¢8E°0%ËËån(Y[Ú6¼¢wëOqx>{=UàÄe@yüWm¾PKÄ_^j+ş‰6GåQ®AêˆÙ.ô”ôıs}Ù6@kÖ•¿aX8JÄI;{©4í]™òN\qh—ùQÍL‡uıq-› 0ùıİ9Œ\m[©pÅlL§HŠqKÄVqk¶’ ıN`¿2‡C¼9³„¥¬ëÀ’İL&¡3ù+ÁÚ«ºáÕÔ¡eıC¿0×-îJ´Ìd¼”ïjòÓ¡²BÕÆVT
->e¿pÄSÔ×ë¢ßj8@“µ÷•=¬j
ì¦[uÒ¯Ôp!4ÄÁ Ù¯{tá1'Y4CJ~“ô!3µ™®j“°ôüû£tıƒN#®=À9ÂÍ#í¦CUÒâ±‰ÏÓ6¶L­­®ØÑ9…»Œ–ø!.'ÌCÏX[i¦y—ùÆÈ(SHKqëã„ƒ±»)úWøÁ‡aÙ™ô¶ƒ±”Ø®Í4ˆyşzçÌı‡çA¬¹H’Ö‰mfqTËU/h’İÛ3’!°Š^ù§Ë-Ş¸A³­‹ûÀ@ï”¹š(Ÿ#-ä –I<Í„bW/ñÙ2ÊØ¨nğYÃÛéËS¥ù¥pØùk:›èO€“xf¿8“"x–œGR¼Br8÷LlÍîwÙ†êL‰xü$ÉÅ›tÍ		æş–’æŒ³­A+²Š`ª¿åĞ¾ªÜK„İ9Ä²ò?q29’
"Ú^,³l?Í+@Y™Î¤—¤¿m1}Ö”ó„L©„í½çHKKIÎf-ƒ¯¶ ½‘aQãMz»µ>9eÂ?RgÃ×oËãfğ1æQOˆÓê¢z›pXLáœ £TL,}K,õúGyÔĞ?¶ÿUª$«)ÏÉlÑ¡şE¬wµ™‡” ú%_Îñvû
a™Œí	]5b=™^‰½«(¥`"1ğŠ	K«Gó€n˜mF§[*…^fÊÆUF4UG(ˆHYè9àÂ YtkYNÛ`Ë[M¼	.ÿeÖˆşïÔeÆôC\@~«ÉSÛÙÆ—U·­úGˆKap5Ì®
§3áÆÚ³Ò
•¡` Ò'IĞDr “ª*UÖŠ°ºœ¸»•øwÆ;wŸ":.-¶$g"
7ë) a8Â¡;Š^­3M}œ ‚&—›kÈ{‚/ÌQ´HVmcÈ£ñÎH Uı€üåøõ¦l»?^Ï¢B±V;Ñ—}ËöFå1A2cª¸úÛ~í¾›Wã™¼S.•ôYÿËõ¦ª¬§¦Éø pO”-¥«ÁõE!QPò0üôY½b	}%» 1'$‚†ü]—zrË;µóU\Ö¬U~9Šâàü[7ïºdİ:ìé„ªY›Ëa®wı¨†ì¢Qh¦Òçº¼2ôoM|}Äµ-w¼7.˜ÀXùI5À¨Ò¿-xS4F´C²½¿èÈe®°FÓ’b(˜½M,ìq¿p„0é[éC5Ï÷w@Æs¯¤\94ü×’×Z²ÍRÿ+cÈ@Ìn®÷YOß¯;³‰ËÈ1OÛÏ«½©é™5ÁØ†$¨ú[ª89œÈ™Ã~Coë{7[ú{·ïkÿª†£qõü’ÖV¡ùwƒ(‚¾d6	lI2Qcë®oNcRŸ³;ìæIB¢Ğ„WVJ6‡ÿSÇ|â @ËÅ8¼×¾ñ$Â/Í=ÊÚvÁŸ|DÀÊ”f35=G º/óæWyN>ÅŒ Ëg*`
Âê4!MÙ+JñîõâN˜÷¸Øç	."ÏµÏÛÃŸ‰²ZÈ"Õ~R‡¥A"k\,¬úŠ	'MKR3µøV'BÙè8µl‡èq‡udG¨\{ıÒ¸ª§æïpˆÎ¶»êRSKĞï°*ÆßÌºØ$Mp‰ÙGøôTwÛÑn•ó˜æ¦Ï½q<Únvs?b®¨ÁHKa­Ò7ˆ‰`²";#Ë$pkÕQzóiÂ)‡'¾
Î'Ï¬‹Á&ä÷÷Ÿp¨€ÌcIÕ´LtşÆ(±,8Å¥ÔU±ë¯–ÄÏ¬nÙ5itwëtO	Û=n5A¨»ØØu›¹¼¥ûdş¦«>°'§+a()Èx‹©;Üûí˜pö^Æ¯YÃ\ß9;ëÊe¦¾1(ìè‚Y“[İ¥©cµ·E¼ub:{¿Ü2¸ÒAÒåÆsš-&£Ê†ªª¾Y‘ç‡8±B¶Í%¥6¯2xoÁƒ¿Ñ§¼Ç+`Ç¡Ñ°2>'Ã•ƒ”†A³¨ä£:ºBç3éÒµŞ%ÖJˆe·÷0‚ö¨!ÔÖîãCƒÇp)¯<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="Palette2">
    <group name="Swing">
      <item class="com.intellij.uiDesigner.HSpacer" tooltip-text="Horizontal Spacer" icon="/com/intellij/uiDesigner/icons/hspacer.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="1" hsize-policy="6" anchor="0" fill="1" />
      </item>
      <item class="com.intellij.uiDesigner.VSpacer" tooltip-text="Vertical Spacer" icon="/com/intellij/uiDesigner/icons/vspacer.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="1" anchor="0" fill="2" />
      </item>
      <item class="javax.swing.JPanel" icon="/com/intellij/uiDesigner/icons/panel.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JScrollPane" icon="/com/intellij/uiDesigner/icons/scrollPane.png" removable="false" auto-create-binding="false" can-attach-label="true">
        <default-constraints vsize-policy="7" hsize-policy="7" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JButton" icon="/com/intellij/uiDesigner/icons/button.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="0" fill="1" />
        <initial-values>
          <property name="text" value="Button" />
        </initial-values>
      </item>
      <item class="javax.swing.JRadioButton" icon="/com/intellij/uiDesigner/icons/radioButton.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="RadioButton" />
        </initial-values>
      </item>
      <item class="javax.swing.JCheckBox" icon="/com/intellij/uiDesigner/icons/checkBox.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="3" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="CheckBox" />
        </initial-values>
      </item>
      <item class="javax.swing.JLabel" icon="/com/intellij/uiDesigner/icons/label.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="0" anchor="8" fill="0" />
        <initial-values>
          <property name="text" value="Label" />
        </initial-values>
      </item>
      <item class="javax.swing.JTextField" icon="/com/intellij/uiDesigner/icons/textField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JPasswordField" icon="/com/intellij/uiDesigner/icons/passwordField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JFormattedTextField" icon="/com/intellij/uiDesigner/icons/formattedTextField.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1">
          <preferred-size width="150" height="-1" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTextArea" icon="/com/intellij/uiDesigner/icons/textArea.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTextPane" icon="/com/intellij/uiDesigner/icons/textPane.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JEditorPane" icon="/com/intellij/uiDesigner/icons/editorPane.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JComboBox" icon="/com/intellij/uiDesigner/icons/comboBox.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="2" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JTable" icon="/com/intellij/uiDesigner/icons/table.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JList" icon="/com/intellij/uiDesigner/icons/list.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="2" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTree" icon="/com/intellij/uiDesigner/icons/tree.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3">
          <preferred-size width="150" height="50" />
        </default-constraints>
      </item>
      <item class="javax.swing.JTabbedPane" icon="/com/intellij/uiDesigner/icons/tabbedPane.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3">
          <preferred-size width="200" height="200" />
        </default-constraints>
      </item>
      <item class="javax.swing.JSplitPane" icon="/com/intellij/uiDesigner/icons/splitPane.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="3" hsize-policy="3" anchor="0" fill="3">
          <preferred-size width="200" height="200" />
        </default-constraints>
      </item>
      <item class="javax.swing.JSpinner" icon="/com/intellij/uiDesigner/icons/spinner.png" removable="false" auto-create-binding="true" can-attach-label="true">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JSlider" icon="/com/intellij/uiDesigner/icons/slider.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="8" fill="1" />
      </item>
      <item class="javax.swing.JSeparator" icon="/com/intellij/uiDesigner/icons/separator.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="6" anchor="0" fill="3" />
      </item>
      <item class="javax.swing.JProgressBar" icon="/com/intellij/uiDesigner/icons/progressbar.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="0" fill="1" />
      </item>
      <item class="javax.swing.JToolBar" icon="/com/intellij/uiDesigner/icons/toolbar.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="6" anchor="0" fill="1">
          <preferred-size width="-1" height="20" />
        </default-constraints>
      </item>
      <item class="javax.swing.JToolBar$Separator" icon="/com/intellij/uiDesigner/icons/toolbarSeparator.png" removable="false" auto-create-binding="false" can-attach-label="false">
        <default-constraints vsize-policy="0" hsize-policy="0" anchor="0" fill="1" />
      </item>
      <item class="javax.swing.JScrollBar" icon="/com/intellij/uiDesigner/icons/scrollbar.png" removable="false" auto-create-binding="true" can-attach-label="false">
        <default-constraints vsize-policy="6" hsize-policy="0" anchor="0" fill="2" />
      </item>
    </group>
  </component>
</project>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
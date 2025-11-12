from typing import List, Dict
import re


class LipSyncManager:
    """
    Manages lip sync data generation for avatar animation
    Maps phonemes to visemes (visual mouth shapes)
    """
    
    # Phoneme to viseme mapping (8 basic mouth shapes)
    # Based on standard viseme sets for 3D avatar animation
    PHONEME_TO_VISEME = {
        # Silence
        'sil': 0,
        'pau': 0,
        
        # A/E sounds (open mouth)
        'aa': 1, 'ae': 1, 'ah': 1, 'aw': 1, 'ay': 1,
        'eh': 1, 'ey': 1,
        
        # E/I sounds (slight smile)
        'er': 2, 'ih': 2, 'iy': 2,
        
        # O sounds (rounded lips)
        'ao': 3, 'ow': 3, 'oy': 3,
        
        # U sounds (pursed lips)
        'uh': 4, 'uw': 4,
        
        # M/B/P sounds (lips together)
        'b': 5, 'm': 5, 'p': 5,
        
        # F/V sounds (teeth on lip)
        'f': 6, 'v': 6,
        
        # Th/S/Z sounds (teeth visible)
        'dh': 7, 'th': 7, 's': 7, 'z': 7, 'sh': 7, 'zh': 7,
        
        # Other consonants (neutral/open)
        'd': 1, 'g': 1, 'k': 1, 'l': 1, 'n': 1,
        'r': 2, 't': 1, 'w': 4, 'y': 2,
        'ch': 7, 'jh': 7, 'ng': 1, 'hh': 1,
    }
    
    def __init__(self):
        self.viseme_names = [
            'silence',      # 0
            'open',         # 1 - A, E sounds
            'smile',        # 2 - I sounds
            'round',        # 3 - O sounds
            'pursed',       # 4 - U sounds
            'closed',       # 5 - M, B, P
            'teeth_lip',    # 6 - F, V
            'teeth',        # 7 - Th, S, Z
        ]
    
    def text_to_visemes(self, text: str, duration: float = None) -> List[Dict]:
        """
        Convert text to viseme sequence with timing
        
        This is a simplified implementation. For production use,
        integrate with phoneme extraction tools like:
        - Rhubarb Lip Sync
        - Montreal Forced Aligner
        - Festival/CMU Flite
        
        Args:
            text: Input text
            duration: Total duration in seconds (if known)
            
        Returns:
            List of viseme data: [{"viseme": int, "start": float, "duration": float}, ...]
        """
        # Simple word-based timing estimation
        words = text.split()
        
        if not words:
            return [{"viseme": 0, "start": 0.0, "duration": 0.5}]
        
        # Estimate duration if not provided (rough: 150 words per minute)
        if duration is None:
            duration = len(words) * 0.4  # ~0.4 seconds per word
        
        time_per_word = duration / len(words)
        viseme_sequence = []
        current_time = 0.0
        
        for word in words:
            # Estimate visemes for word (simplified)
            word_visemes = self._estimate_word_visemes(word.lower())
            time_per_viseme = time_per_word / max(len(word_visemes), 1)
            
            for viseme in word_visemes:
                viseme_sequence.append({
                    "viseme": viseme,
                    "start": current_time,
                    "duration": time_per_viseme
                })
                current_time += time_per_viseme
        
        return viseme_sequence
    
    def _estimate_word_visemes(self, word: str) -> List[int]:
        """
        Estimate visemes for a word based on simple rules
        This is a very basic implementation - use proper phoneme tools for production
        """
        visemes = []
        
        # Simple vowel/consonant detection
        vowels = 'aeiou'
        
        for char in word:
            if char in vowels:
                if char in 'ae':
                    visemes.append(1)  # open
                elif char in 'i':
                    visemes.append(2)  # smile
                elif char in 'o':
                    visemes.append(3)  # round
                elif char in 'u':
                    visemes.append(4)  # pursed
            else:
                if char in 'mbp':
                    visemes.append(5)  # closed
                elif char in 'fv':
                    visemes.append(6)  # teeth_lip
                elif char in 'szth':
                    visemes.append(7)  # teeth
                else:
                    visemes.append(1)  # neutral open
        
        # Add silence between some consonants
        if len(visemes) > 3:
            visemes.insert(len(visemes) // 2, 0)
        
        return visemes if visemes else [0]
    
    def phonemes_to_visemes(self, phonemes: List[Dict]) -> List[Dict]:
        """
        Convert phoneme sequence to viseme sequence
        
        Args:
            phonemes: List of phoneme data [{"phoneme": str, "start": float, "end": float}, ...]
            
        Returns:
            List of viseme data
        """
        viseme_sequence = []
        
        for phoneme_data in phonemes:
            phoneme = phoneme_data.get('phoneme', 'sil').lower()
            start = phoneme_data.get('start', 0.0)
            end = phoneme_data.get('end', 0.0)
            
            # Map phoneme to viseme
            viseme = self.PHONEME_TO_VISEME.get(phoneme, 0)
            
            viseme_sequence.append({
                "viseme": viseme,
                "viseme_name": self.viseme_names[viseme],
                "start": start,
                "duration": end - start
            })
        
        return viseme_sequence
    
    def get_viseme_at_time(self, viseme_sequence: List[Dict], time: float) -> int:
        """Get the viseme index at a specific time"""
        for viseme_data in viseme_sequence:
            start = viseme_data['start']
            end = start + viseme_data['duration']
            
            if start <= time < end:
                return viseme_data['viseme']
        
        return 0  # Default to silence


# Global lip sync manager instance
lipsync_manager = LipSyncManager()



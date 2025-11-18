import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    classOrProfession: '',
    techInterests: '',
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(URL.createObjectURL(file));
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the profile data to a backend.
    console.log('Profile Saved:', { ...formData, profilePicture: fileName });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-dark-slate flex flex-col items-center justify-center p-4 animate-slide-in-fade">
        <div className="w-full max-w-md mx-auto bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-electric-blue/10">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Setup Your Profile</h1>
            <p className="text-center text-muted-gray mb-8">Let's get you started in the community.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <img 
                            src={profilePicture || `https://api.dicebear.com/8.x/bottts/svg?seed=skilllink`} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 bg-slate-800"
                        />
                         <label htmlFor="profilePicture" title="Upload Profile Picture" className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-electric-blue rounded-full cursor-pointer hover:bg-neon-purple transition-colors ring-4 ring-slate-900">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                            <input 
                                type="file" 
                                id="profilePicture" 
                                name="profilePicture"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handlePictureChange}
                                className="hidden" 
                                aria-label="Upload Profile Picture"
                            />
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-muted-gray">Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Ada Lovelace" required className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="state" className="block mb-2 text-sm font-medium text-muted-gray">State</label>
                        <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} placeholder="e.g., California" required className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="classOrProfession" className="block mb-2 text-sm font-medium text-muted-gray">Profession</label>
                        <input type="text" name="classOrProfession" id="classOrProfession" value={formData.classOrProfession} onChange={handleChange} placeholder="e.g., AI Engineer" required className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="techInterests" className="block mb-2 text-sm font-medium text-muted-gray">Tech Interests</label>
                    <textarea name="techInterests" id="techInterests" value={formData.techInterests} onChange={handleChange} placeholder="e.g., AI, ML, Web3, Solidity" required rows={3} className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition resize-none"></textarea>
                </div>
                
                <button 
                    type="submit" 
                    className="w-full text-lg font-semibold text-white px-8 py-4 rounded-lg bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-electric-blue"
                >
                    Save Profile
                </button>
            </form>
        </div>
    </div>
  );
};

export default ProfileSetup;